import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Shipment } from './entities/shipment.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { NOTIFICATION_EVENTS } from '../notification/notification.events';

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateShipmentDto): Promise<Shipment> {
    const existing = await this.shipmentRepo.findOne({ where: { orderId: dto.orderId } });
    if (existing) {
      throw new ConflictException('该订单已有物流信息');
    }

    const orderRepo = this.dataSource.getRepository('Order');
    const order = await orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    const now = new Date().toISOString();
    const shipment = new Shipment();
    shipment.orderId = dto.orderId;
    shipment.trackingNo = dto.trackingNo;
    shipment.carrier = dto.carrier;
    shipment.status = 'pending';
    shipment.estimatedDelivery = dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : undefined as any;
    shipment.statusHistory = [{ status: 'pending', location: '', time: now, description: '物流单已创建' }];

    const saved = await this.shipmentRepo.save(shipment);

    await orderRepo
      .createQueryBuilder()
      .update()
      .set({ status: 'shipping' })
      .where('id = :id AND status = :status', { id: dto.orderId, status: 'paid' })
      .execute();

    return saved;
  }

  async findAll(query: QueryShipmentDto) {
    const { page = 1, pageSize = 10, trackingNo, carrier, status, orderNo } = query;

    const qb = this.shipmentRepo.createQueryBuilder('s');

    if (trackingNo) {
      qb.andWhere('s.tracking_no LIKE :trackingNo', { trackingNo: `%${trackingNo}%` });
    }
    if (carrier) {
      qb.andWhere('s.carrier LIKE :carrier', { carrier: `%${carrier}%` });
    }
    if (status) {
      qb.andWhere('s.status = :status', { status });
    }
    if (orderNo) {
      const orderRepo = this.dataSource.getRepository('Order');
      const orders = await orderRepo
        .createQueryBuilder('o')
        .select('o.id')
        .where('o.order_no LIKE :orderNo', { orderNo: `%${orderNo}%` })
        .getMany();
      const orderIds = orders.map((o: any) => o.id);
      if (orderIds.length > 0) {
        qb.andWhere('s.order_id IN (:...orderIds)', { orderIds });
      } else {
        qb.andWhere('1 = 0');
      }
    }

    qb.orderBy('s.created_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({ where: { id } });
    if (!shipment) {
      throw new NotFoundException('物流信息不存在');
    }
    return shipment;
  }

  async findByOrderId(orderId: number): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({ where: { orderId } });
    if (!shipment) {
      throw new NotFoundException('该订单暂无物流信息');
    }
    return shipment;
  }

  async updateTracking(id: number, dto: UpdateTrackingDto): Promise<Shipment> {
    const shipment = await this.findOne(id);
    const now = new Date().toISOString();

    shipment.statusHistory.push({
      status: dto.status,
      location: dto.location || '',
      time: now,
      description: dto.description,
    });
    shipment.status = dto.status;

    const saved = await this.shipmentRepo.save(shipment);

    if (dto.status === 'delivered') {
      const orderRepo = this.dataSource.getRepository('Order');
      await orderRepo
        .createQueryBuilder()
        .update()
        .set({ status: 'shipped', shippedAt: new Date() })
        .where('id = :id AND status = :status', { id: shipment.orderId, status: 'shipping' })
        .execute();

      this.eventEmitter.emit(NOTIFICATION_EVENTS.ORDER_STATUS_CHANGED, {
        orderId: shipment.orderId,
        orderNo: '',
        oldStatus: 'shipping',
        newStatus: 'shipped',
      });
    }

    return saved;
  }
}
