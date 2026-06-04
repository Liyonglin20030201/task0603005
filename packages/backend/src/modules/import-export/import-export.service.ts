import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Product } from '../product/entities/product.entity';
import { Order } from '../order/entities/order.entity';
import { User } from '../user/entities/user.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
  ) {}

  async exportProducts(res: Response) {
    const products = await this.productRepo.find();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('商品列表');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: '商品名称', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: '分类ID', key: 'categoryId', width: 10 },
      { header: '售价', key: 'price', width: 12 },
      { header: '成本价', key: 'costPrice', width: 12 },
      { header: '状态', key: 'status', width: 8 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    products.forEach((p) => {
      sheet.addRow({
        id: p.id,
        name: p.name,
        sku: p.sku,
        categoryId: p.categoryId,
        price: p.price,
        costPrice: p.costPrice,
        status: p.status === 1 ? '上架' : '下架',
        createdAt: p.createdAt,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    await workbook.xlsx.write(res);
  }

  async importProducts(buffer: Buffer): Promise<{ success: number; failed: number; errors: string[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet(1);
    if (!sheet) throw new BusinessException('Excel文件格式错误');

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    const rows: { rowNumber: number; name: string; sku: string; categoryId: number; price: number; costPrice: number }[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const name = row.getCell(1).value?.toString();
      const sku = row.getCell(2).value?.toString();
      const categoryId = Number(row.getCell(3).value);
      const price = Number(row.getCell(4).value);

      if (!name || !sku || !categoryId || !price) {
        failed++;
        errors.push(`第${rowNumber}行: 缺少必填字段`);
        return;
      }

      rows.push({ rowNumber, name, sku, categoryId, price, costPrice: Number(row.getCell(5).value) || 0 });
    });

    for (const row of rows) {
      try {
        const product = await this.productRepo.save(
          this.productRepo.create({
            name: row.name,
            sku: row.sku,
            categoryId: row.categoryId,
            price: row.price,
            costPrice: row.costPrice,
            status: 1,
          }),
        );
        await this.inventoryRepo.save(
          this.inventoryRepo.create({
            productId: product.id,
            quantity: 0,
            lockedQuantity: 0,
            warningThreshold: 10,
            version: 0,
          }),
        );
        success++;
      } catch (e: any) {
        failed++;
        errors.push(`第${row.rowNumber}行: ${e.message}`);
      }
    }

    return { success, failed, errors };
  }

  async exportOrders(res: Response, status?: string) {
    const qb = this.orderRepo.createQueryBuilder('order').leftJoinAndSelect('order.items', 'items');
    if (status) {
      qb.where('order.status = :status', { status });
    }
    const orders = await qb.getMany();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('订单列表');

    sheet.columns = [
      { header: '订单号', key: 'orderNo', width: 25 },
      { header: '用户ID', key: 'userId', width: 10 },
      { header: '状态', key: 'status', width: 15 },
      { header: '总金额', key: 'totalAmount', width: 12 },
      { header: '优惠金额', key: 'discountAmount', width: 12 },
      { header: '实付金额', key: 'payAmount', width: 12 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    orders.forEach((o) => {
      sheet.addRow({
        orderNo: o.orderNo,
        userId: o.userId,
        status: o.status,
        totalAmount: o.totalAmount,
        discountAmount: o.discountAmount,
        payAmount: o.payAmount,
        createdAt: o.createdAt,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    await workbook.xlsx.write(res);
  }

  async exportUsers(res: Response) {
    const users = await this.userRepo.find();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('用户列表');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: '用户名', key: 'username', width: 20 },
      { header: '昵称', key: 'nickname', width: 20 },
      { header: '邮箱', key: 'email', width: 25 },
      { header: '手机号', key: 'phone', width: 15 },
      { header: '性别', key: 'gender', width: 8 },
      { header: '状态', key: 'status', width: 8 },
      { header: '注册时间', key: 'createdAt', width: 20 },
    ];

    users.forEach((u) => {
      sheet.addRow({
        id: u.id,
        username: u.username,
        nickname: u.nickname,
        email: u.email,
        phone: u.phone,
        gender: u.gender === 1 ? '男' : u.gender === 2 ? '女' : '未知',
        status: u.status === 1 ? '正常' : '禁用',
        createdAt: u.createdAt,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    await workbook.xlsx.write(res);
  }
}
