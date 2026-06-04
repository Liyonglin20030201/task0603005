import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Channel } from './entities/channel.entity';
import { ChannelOrder } from './entities/channel-order.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { QueryChannelOrderDto } from './dto/query-channel-order.dto';
import { InventoryService } from '../inventory/inventory.service';
import { NOTIFICATION_EVENTS } from '../notification/notification.events';

const MAX_RETRY_COUNT = 3;

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
    @InjectRepository(ChannelOrder)
    private readonly channelOrderRepo: Repository<ChannelOrder>,
    private readonly inventoryService: InventoryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createChannel(dto: CreateChannelDto): Promise<Channel> {
    const channel = this.channelRepo.create(dto);
    return this.channelRepo.save(channel);
  }

  async updateChannel(id: number, dto: UpdateChannelDto): Promise<Channel> {
    const channel = await this.getChannel(id);
    Object.assign(channel, dto);
    return this.channelRepo.save(channel);
  }

  async deleteChannel(id: number): Promise<void> {
    const channel = await this.getChannel(id);
    const orderCount = await this.channelOrderRepo.count({ where: { channelId: id } });
    if (orderCount > 0) {
      throw new BadRequestException(`渠道「${channel.name}」下有 ${orderCount} 条订单记录，无法删除`);
    }
    await this.channelRepo.delete(id);
  }

  async listChannels(): Promise<Channel[]> {
    return this.channelRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getChannel(id: number): Promise<Channel> {
    const channel = await this.channelRepo.findOne({ where: { id } });
    if (!channel) {
      throw new NotFoundException('渠道不存在');
    }
    return channel;
  }

  async listChannelOrders(query: QueryChannelOrderDto) {
    const { page = 1, pageSize = 20, channelId, platform, syncStatus, platformOrderNo, startDate, endDate } = query;

    const qb = this.channelOrderRepo.createQueryBuilder('co');
    qb.leftJoinAndSelect('co.channel', 'channel');

    if (channelId) {
      qb.andWhere('co.channel_id = :channelId', { channelId });
    }
    if (platform) {
      qb.andWhere('co.platform = :platform', { platform });
    }
    if (syncStatus) {
      qb.andWhere('co.sync_status = :syncStatus', { syncStatus });
    }
    if (platformOrderNo) {
      qb.andWhere('co.platform_order_no LIKE :platformOrderNo', { platformOrderNo: `%${platformOrderNo}%` });
    }
    if (startDate) {
      qb.andWhere('co.platform_created_at >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('co.platform_created_at <= :endDate', { endDate: `${endDate} 23:59:59` });
    }

    qb.orderBy('co.created_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    const mappedItems = items.map((item) => ({
      ...item,
      channelName: item.channel?.name,
      channel: undefined,
    }));

    return {
      items: mappedItems,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async syncOrders(channelId: number): Promise<{ synced: number }> {
    const channel = await this.getChannel(channelId);
    if (!channel.syncEnabled) {
      throw new BadRequestException('该渠道未启用同步');
    }

    // Simulate pulling orders from platform (mock data for demo)
    const mockOrders = this.generateMockOrders(channel);
    let syncedCount = 0;

    for (const mockOrder of mockOrders) {
      const existing = await this.channelOrderRepo.findOne({
        where: { platformOrderNo: mockOrder.platformOrderNo },
      });
      if (!existing) {
        const order = this.channelOrderRepo.create(mockOrder);
        await this.channelOrderRepo.save(order);
        syncedCount++;
      }
    }

    // Update last sync time
    channel.lastSyncAt = new Date();
    await this.channelRepo.save(channel);

    this.eventEmitter.emit(NOTIFICATION_EVENTS.ORDER_STATUS_CHANGED, {
      orderId: 0,
      orderNo: `channel_sync_${channel.name}`,
      oldStatus: 'sync_start',
      newStatus: `synced_${syncedCount}`,
    });

    return { synced: syncedCount };
  }

  async matchOrder(channelOrderId: number): Promise<ChannelOrder> {
    const channelOrder = await this.channelOrderRepo.findOne({ where: { id: channelOrderId } });
    if (!channelOrder) {
      throw new NotFoundException('渠道订单不存在');
    }
    if (channelOrder.syncStatus === 'synced') {
      throw new BadRequestException('该订单已同步');
    }

    const items = (channelOrder.items || []) as any[];
    const lockedItems: { productId: number; quantity: number }[] = [];

    try {
      for (const item of items) {
        if (item.productId && item.quantity) {
          await this.inventoryService.lockStock(item.productId, item.quantity, 0);
          lockedItems.push({ productId: item.productId, quantity: item.quantity });
        }
      }

      const localOrderNo = `LO${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      channelOrder.localOrderNo = localOrderNo;
      channelOrder.localOrderId = Math.floor(Math.random() * 10000) + 1;
      channelOrder.syncStatus = 'synced';
      channelOrder.syncedAt = new Date();
      channelOrder.failReason = null;

      return this.channelOrderRepo.save(channelOrder);
    } catch (error: any) {
      // Rollback locked inventory
      for (const locked of lockedItems) {
        try {
          await this.inventoryService.unlockStock(locked.productId, locked.quantity, 0);
        } catch {}
      }

      channelOrder.syncStatus = 'failed';
      channelOrder.failReason = error.message || '库存锁定失败';
      channelOrder.retryCount = (channelOrder.retryCount || 0) + 1;
      const backoffMinutes = Math.pow(2, channelOrder.retryCount);
      channelOrder.nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
      await this.channelOrderRepo.save(channelOrder);

      throw new BadRequestException(`订单同步失败: ${error.message}`);
    }
  }

  @Cron('*/2 * * * *')
  async retryFailedOrders(): Promise<void> {
    const now = new Date();
    const failedOrders = await this.channelOrderRepo.find({
      where: {
        syncStatus: 'failed',
        nextRetryAt: LessThanOrEqual(now),
      },
    });

    const retryable = failedOrders.filter((o) => o.retryCount < MAX_RETRY_COUNT);

    for (const order of retryable) {
      try {
        await this.matchOrder(order.id);
        this.logger.log(`渠道订单 ${order.platformOrderNo} 重试成功`);
      } catch {
        this.logger.warn(
          `渠道订单 ${order.platformOrderNo} 重试失败 (${order.retryCount}/${MAX_RETRY_COUNT})`,
        );
      }
    }
  }

  async batchSync(): Promise<{ total: number; synced: number; failed: number }> {
    const channels = await this.channelRepo.find({ where: { syncEnabled: true, status: 1 } });
    let totalSynced = 0;
    let failedCount = 0;

    for (const channel of channels) {
      try {
        const result = await this.syncOrders(channel.id);
        totalSynced += result.synced;
      } catch {
        failedCount++;
      }
    }

    return { total: channels.length, synced: totalSynced, failed: failedCount };
  }

  private generateMockOrders(channel: Channel): Partial<ChannelOrder>[] {
    const count = Math.floor(Math.random() * 5) + 1;
    const orders: Partial<ChannelOrder>[] = [];
    const platformStatuses = ['待发货', '已发货', '已完成', '退款中'];
    const nicknames = ['用户A', '买家小王', '网购达人', '张三', '李四', '消费者001'];

    for (let i = 0; i < count; i++) {
      const totalAmount = +(Math.random() * 500 + 50).toFixed(2);
      const payAmount = +(totalAmount * (Math.random() * 0.2 + 0.8)).toFixed(2);
      const itemCount = Math.floor(Math.random() * 5) + 1;
      const timestamp = Date.now() - Math.floor(Math.random() * 86400000 * 7);

      orders.push({
        channelId: channel.id,
        platform: channel.platform,
        platformOrderNo: `${channel.platform.toUpperCase()}-${timestamp}-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
        buyerNickname: nicknames[Math.floor(Math.random() * nicknames.length)],
        totalAmount,
        payAmount,
        itemCount,
        items: Array.from({ length: itemCount }, (_, idx) => ({
          productId: idx + 1,
          name: `商品${idx + 1}`,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: +(Math.random() * 200 + 10).toFixed(2),
        })),
        platformStatus: platformStatuses[Math.floor(Math.random() * platformStatuses.length)],
        syncStatus: 'pending' as const,
        platformCreatedAt: new Date(timestamp),
        rawData: { source: channel.platform, fetchedAt: new Date().toISOString() },
      });
    }

    return orders;
  }
}
