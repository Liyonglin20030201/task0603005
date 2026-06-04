import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from '../modules/order/order.service';
import { Order } from '../modules/order/entities/order.entity';
import { OrderItem } from '../modules/order/entities/order-item.entity';
import { Product } from '../modules/product/entities/product.entity';
import { Coupon } from '../modules/coupon/entities/coupon.entity';
import { UserCoupon } from '../modules/coupon/entities/user-coupon.entity';
import { InventoryService } from '../modules/inventory/inventory.service';
import { DataSource } from 'typeorm';
import { BusinessException } from '../common/exceptions/business.exception';
import { OrderStatus } from '@ecommerce/shared';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: any;
  let inventoryService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn((entity) => ({ ...entity, id: 1 })),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            })),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: { save: jest.fn() },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Coupon),
          useValue: { findOne: jest.fn(), increment: jest.fn(), decrement: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserCoupon),
          useValue: { findOne: jest.fn(), update: jest.fn() },
        },
        {
          provide: InventoryService,
          useValue: {
            lockStock: jest.fn(),
            unlockStock: jest.fn(),
            deductStock: jest.fn(),
            restoreStock: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => ({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: { save: jest.fn((_, entity) => ({ ...entity, id: 1 })) },
            })),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get(getRepositoryToken(Order));
    inventoryService = module.get(InventoryService);
  });

  describe('updateStatus - 状态机', () => {
    it('pending_payment → paid 应成功', async () => {
      const order = {
        id: 1,
        status: OrderStatus.PENDING_PAYMENT,
        items: [{ productId: 1, quantity: 2 }],
        couponId: null,
      };
      orderRepo.findOne.mockResolvedValue(order);
      orderRepo.save.mockResolvedValue({ ...order, status: OrderStatus.PAID });

      await service.updateStatus(1, { status: OrderStatus.PAID });

      expect(inventoryService.unlockStock).toHaveBeenCalled();
      expect(inventoryService.deductStock).toHaveBeenCalled();
    });

    it('pending_payment → shipped 非法转换应抛出异常', async () => {
      const order = { id: 1, status: OrderStatus.PENDING_PAYMENT, items: [] };
      orderRepo.findOne.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, { status: OrderStatus.SHIPPED }),
      ).rejects.toThrow('订单状态不允许');
    });

    it('paid → cancelled 非法转换应抛出异常', async () => {
      const order = { id: 1, status: OrderStatus.PAID, items: [] };
      orderRepo.findOne.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, { status: OrderStatus.CANCELLED }),
      ).rejects.toThrow('订单状态不允许');
    });

    it('cancelled → 任何状态 应抛出异常（终态）', async () => {
      const order = { id: 1, status: OrderStatus.CANCELLED, items: [] };
      orderRepo.findOne.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, { status: OrderStatus.PAID }),
      ).rejects.toThrow('订单状态不允许');
    });

    it('pending_payment → cancelled 应释放锁定库存并归还优惠券', async () => {
      const order = {
        id: 1,
        status: OrderStatus.PENDING_PAYMENT,
        items: [{ productId: 1, quantity: 3 }],
        couponId: 5,
      };
      orderRepo.findOne.mockResolvedValue(order);
      orderRepo.save.mockResolvedValue({ ...order, status: OrderStatus.CANCELLED });
      const couponRepo = module_get_coupon();

      await service.updateStatus(1, { status: OrderStatus.CANCELLED, reason: '用户取消' });

      expect(inventoryService.unlockStock).toHaveBeenCalledWith(1, 3, 1);
    });

    it('completed → refunded 应归还库存', async () => {
      const order = {
        id: 1,
        status: OrderStatus.COMPLETED,
        items: [{ productId: 1, quantity: 2 }],
        couponId: null,
      };
      orderRepo.findOne.mockResolvedValue(order);
      orderRepo.save.mockResolvedValue({ ...order, status: OrderStatus.REFUNDED });

      await service.updateStatus(1, { status: OrderStatus.REFUNDED });

      expect(inventoryService.restoreStock).toHaveBeenCalledWith(1, 2, 1);
    });
  });

  describe('getStatusTransitions', () => {
    it('应返回当前状态的合法转换', async () => {
      orderRepo.findOne.mockResolvedValue({ id: 1, status: OrderStatus.PAID });

      const result = await service.getStatusTransitions(1);

      expect(result.currentStatus).toBe(OrderStatus.PAID);
      expect(result.allowedTransitions).toContain(OrderStatus.SHIPPING);
      expect(result.allowedTransitions).toContain(OrderStatus.REFUNDED);
      expect(result.allowedTransitions).not.toContain(OrderStatus.CANCELLED);
    });
  });
});

function module_get_coupon() {
  return null;
}
