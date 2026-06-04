import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { UserCoupon } from '../coupon/entities/user-coupon.entity';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { OrderStatus, ORDER_TRANSITIONS } from '@ecommerce/shared';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepo: Repository<UserCoupon>,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  private generateOrderNo(): string {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD${dateStr}${random}`;
  }

  async create(dto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of dto.items) {
        const product = await this.productRepo.findOne({ where: { id: item.productId } });
        if (!product) {
          throw new BusinessException(`商品ID ${item.productId} 不存在`);
        }
        if (product.status === 0) {
          throw new BusinessException(`商品 "${product.name}" 已下架`);
        }

        await this.inventoryService.lockStock(product.id, item.quantity, 0);

        const subtotal = Number(product.price) * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.images?.[0] || '',
          price: product.price,
          quantity: item.quantity,
          subtotal,
        });
      }

      let discountAmount = 0;
      if (dto.couponId) {
        const userCoupon = await this.userCouponRepo.findOne({
          where: { couponId: dto.couponId, userId: dto.userId, status: 'unused' },
        });
        if (!userCoupon) {
          throw new BusinessException('优惠券无效或已使用');
        }
        const coupon = await this.couponRepo.findOne({ where: { id: dto.couponId } });
        if (!coupon || coupon.status === 0) {
          throw new BusinessException('优惠券已失效');
        }
        if (new Date() < coupon.startTime || new Date() > coupon.endTime) {
          throw new BusinessException('优惠券不在有效期内');
        }
        if (totalAmount < Number(coupon.minAmount)) {
          throw new BusinessException(`订单金额未达到优惠券最低使用金额 ¥${coupon.minAmount}`);
        }

        if (coupon.type === 'fixed') {
          discountAmount = Number(coupon.value);
        } else {
          discountAmount = totalAmount * (Number(coupon.value) / 100);
        }
        discountAmount = Math.min(discountAmount, totalAmount);
      }

      const payAmount = totalAmount - discountAmount;

      const order = this.orderRepo.create({
        orderNo: this.generateOrderNo(),
        userId: dto.userId,
        status: OrderStatus.PENDING_PAYMENT,
        totalAmount,
        discountAmount,
        payAmount,
        couponId: dto.couponId || null,
        address: dto.address || null,
        remark: dto.remark || '',
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      for (const item of orderItems) {
        item.orderId = savedOrder.id;
      }
      await queryRunner.manager.save(OrderItem, orderItems);

      if (dto.couponId) {
        await this.userCouponRepo.update(
          { couponId: dto.couponId, userId: dto.userId, status: 'unused' },
          { status: 'used', usedAt: new Date(), orderId: savedOrder.id },
        );
        await this.couponRepo.increment({ id: dto.couponId }, 'usedCount', 1);
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryOrderDto) {
    const { page, pageSize, sortBy, sortOrder, orderNo, userId, status, startDate, endDate } =
      query;
    const qb = this.orderRepo.createQueryBuilder('order').leftJoinAndSelect('order.items', 'items');

    if (orderNo) {
      qb.andWhere('order.orderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });
    }
    if (userId) {
      qb.andWhere('order.userId = :userId', { userId });
    }
    if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    if (startDate) {
      qb.andWhere('order.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('order.createdAt <= :endDate', { endDate });
    }

    qb.orderBy(`order.${sortBy || 'createdAt'}`, sortOrder || 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new NotFoundException('订单不存在');

    const currentStatus = order.status as OrderStatus;
    const targetStatus = dto.status as OrderStatus;
    const allowedTransitions = ORDER_TRANSITIONS[currentStatus];

    if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
      throw new BusinessException(
        `订单状态不允许从 "${currentStatus}" 变更为 "${targetStatus}"`,
      );
    }

    switch (targetStatus) {
      case OrderStatus.PAID:
        order.paidAt = new Date();
        for (const item of order.items) {
          await this.inventoryService.unlockStock(item.productId, item.quantity, order.id);
          await this.inventoryService.deductStock(item.productId, item.quantity, order.id);
        }
        break;

      case OrderStatus.CANCELLED:
        order.cancelledAt = new Date();
        order.cancelReason = dto.reason || '';
        for (const item of order.items) {
          await this.inventoryService.unlockStock(item.productId, item.quantity, order.id);
        }
        if (order.couponId) {
          await this.userCouponRepo.update(
            { orderId: order.id },
            { status: 'unused', usedAt: null, orderId: null },
          );
          await this.couponRepo.decrement({ id: order.couponId }, 'usedCount', 1);
        }
        break;

      case OrderStatus.SHIPPING:
        break;

      case OrderStatus.SHIPPED:
        order.shippedAt = new Date();
        break;

      case OrderStatus.COMPLETED:
        order.completedAt = new Date();
        break;

      case OrderStatus.REFUNDED:
        for (const item of order.items) {
          await this.inventoryService.restoreStock(item.productId, item.quantity, order.id);
        }
        if (order.couponId) {
          await this.userCouponRepo.update(
            { orderId: order.id },
            { status: 'unused', usedAt: null, orderId: null },
          );
          await this.couponRepo.decrement({ id: order.couponId }, 'usedCount', 1);
        }
        break;
    }

    order.status = targetStatus;
    return this.orderRepo.save(order);
  }

  async getStatusTransitions(id: number) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('订单不存在');
    const currentStatus = order.status as OrderStatus;
    return {
      currentStatus,
      allowedTransitions: ORDER_TRANSITIONS[currentStatus] || [],
    };
  }
}
