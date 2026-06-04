import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from '../modules/inventory/inventory.service';
import { Inventory } from '../modules/inventory/entities/inventory.entity';
import { InventoryLog } from '../modules/inventory/entities/inventory-log.entity';
import { Product } from '../modules/product/entities/product.entity';
import { DataSource } from 'typeorm';
import { BusinessException } from '../common/exceptions/business.exception';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepo: any;
  let logRepo: any;

  const mockInventory = {
    id: 1,
    productId: 1,
    quantity: 100,
    lockedQuantity: 10,
    warningThreshold: 10,
    version: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoin: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            })),
          },
        },
        {
          provide: getRepositoryToken(InventoryLog),
          useValue: {
            create: jest.fn((data) => data),
            save: jest.fn(),
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    inventoryRepo = module.get(getRepositoryToken(Inventory));
    logRepo = module.get(getRepositoryToken(InventoryLog));
  });

  describe('deductStock', () => {
    it('应成功扣减库存', async () => {
      inventoryRepo.findOne.mockResolvedValue({ ...mockInventory });
      inventoryRepo.update.mockResolvedValue({ affected: 1 });

      await service.deductStock(1, 5, 100);

      expect(inventoryRepo.update).toHaveBeenCalledWith(
        { id: 1, version: 0 },
        { quantity: 95, version: 1 },
      );
      expect(logRepo.save).toHaveBeenCalled();
    });

    it('库存不足时应抛出异常', async () => {
      inventoryRepo.findOne.mockResolvedValue({ ...mockInventory, quantity: 10, lockedQuantity: 8 });

      await expect(service.deductStock(1, 5, 100)).rejects.toThrow(BusinessException);
      await expect(service.deductStock(1, 5, 100)).rejects.toThrow('库存不足');
    });

    it('乐观锁冲突时应重试', async () => {
      inventoryRepo.findOne.mockResolvedValue({ ...mockInventory });
      inventoryRepo.update
        .mockResolvedValueOnce({ affected: 0 })
        .mockResolvedValueOnce({ affected: 1 });

      await service.deductStock(1, 5, 100);

      expect(inventoryRepo.update).toHaveBeenCalledTimes(2);
    });

    it('多次重试失败应抛出冲突异常', async () => {
      inventoryRepo.findOne.mockResolvedValue({ ...mockInventory });
      inventoryRepo.update.mockResolvedValue({ affected: 0 });

      await expect(service.deductStock(1, 5, 100)).rejects.toThrow('库存更新冲突，请重试');
      expect(inventoryRepo.update).toHaveBeenCalledTimes(3);
    });
  });

  describe('lockStock', () => {
    it('应成功锁定库存', async () => {
      inventoryRepo.findOne.mockResolvedValue({ ...mockInventory });
      inventoryRepo.update.mockResolvedValue({ affected: 1 });

      await service.lockStock(1, 20, 100);

      expect(inventoryRepo.update).toHaveBeenCalledWith(
        { id: 1, version: 0 },
        { lockedQuantity: 30, version: 1 },
      );
    });

    it('可用库存不足时应抛出异常', async () => {
      inventoryRepo.findOne.mockResolvedValue({ ...mockInventory, quantity: 15, lockedQuantity: 10 });

      await expect(service.lockStock(1, 10, 100)).rejects.toThrow('可用库存不足');
    });
  });

  describe('adjust', () => {
    it('应成功调整库存（入库）', async () => {
      inventoryRepo.findOne.mockResolvedValue({ ...mockInventory });
      inventoryRepo.update.mockResolvedValue({ affected: 1 });

      await service.adjust({ productId: 1, quantity: 50, remark: '采购入库' }, 1);

      expect(inventoryRepo.update).toHaveBeenCalledWith(
        { id: 1, version: 0 },
        { quantity: 150, version: 1 },
      );
    });

    it('调整后库存为负应抛出异常', async () => {
      inventoryRepo.findOne.mockResolvedValue({ ...mockInventory });

      await expect(
        service.adjust({ productId: 1, quantity: -200, remark: '出库' }, 1),
      ).rejects.toThrow('调整后库存不能为负数');
    });
  });
});
