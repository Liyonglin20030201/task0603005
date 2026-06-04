import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
  ) {}

  async getDashboard() {
    const totalOrders = await this.orderRepo.count();
    const totalProducts = await this.productRepo.count();
    const totalUsers = await this.userRepo.count();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today: todayStart })
      .getCount();

    const salesResult = await this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.payAmount)', 'total')
      .where('order.status NOT IN (:...statuses)', {
        statuses: ['cancelled', 'refunded'],
      })
      .getRawOne();

    const lowStockCount = await this.inventoryRepo
      .createQueryBuilder('inv')
      .where('inv.quantity <= inv.warningThreshold')
      .getCount();

    return {
      totalOrders,
      todayOrders,
      totalProducts,
      totalUsers,
      totalSales: Number(salesResult?.total || 0),
      lowStockCount,
    };
  }

  async getSalesReport(startDate: string, endDate: string) {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('COUNT(*)', 'orderCount')
      .addSelect('SUM(order.payAmount)', 'salesAmount')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.status NOT IN (:...statuses)', {
        statuses: ['cancelled', 'refunded'],
      })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      date: item.date,
      orderCount: Number(item.orderCount),
      salesAmount: Number(item.salesAmount),
    }));
  }

  async getOrderStatusReport() {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    return result.map((item) => ({
      status: item.status,
      count: Number(item.count),
    }));
  }

  async getTopProducts(limit: number = 10) {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .select('item.productId', 'productId')
      .addSelect('item.productName', 'productName')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.subtotal)', 'totalAmount')
      .where('order.status NOT IN (:...statuses)', {
        statuses: ['cancelled', 'refunded'],
      })
      .groupBy('item.productId')
      .addGroupBy('item.productName')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantity: Number(item.totalQuantity),
      totalAmount: Number(item.totalAmount),
    }));
  }

  async getInventoryReport() {
    const total = await this.inventoryRepo.count();
    const lowStock = await this.inventoryRepo
      .createQueryBuilder('inv')
      .where('inv.quantity <= inv.warningThreshold')
      .getCount();
    const outOfStock = await this.inventoryRepo
      .createQueryBuilder('inv')
      .where('inv.quantity = 0')
      .getCount();

    return { total, lowStock, outOfStock, normal: total - lowStock - outOfStock };
  }
}
