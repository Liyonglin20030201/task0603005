import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { QueryForecastDto } from './dto/query-forecast.dto';

@Injectable()
export class ForecastService {
  constructor(private readonly dataSource: DataSource) {}

  async getForecastList(query: QueryForecastDto) {
    const {
      page = 1,
      pageSize = 10,
      productName,
      categoryId,
      leadTime = 7,
      safetyStockDays = 3,
      onlyLowStock,
    } = query;

    const now = new Date();
    const date30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const date14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const date7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    let productFilter = '';
    const params: any[] = [];

    if (productName) {
      productFilter += ' AND p.name LIKE ?';
      params.push(`%${productName}%`);
    }
    if (categoryId) {
      productFilter += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    const sql = `
      SELECT
        p.id AS productId,
        p.name AS productName,
        p.sku AS productSku,
        inv.quantity AS currentStock,
        inv.locked_quantity AS lockedQuantity,
        inv.warning_threshold AS warningThreshold,
        COALESCE(s30.total_qty, 0) AS totalSales30,
        COALESCE(s14.total_qty, 0) AS totalSales14,
        COALESCE(s7.total_qty, 0) AS totalSales7,
        COALESCE(s30.order_count, 0) AS orderCount30
      FROM products p
      INNER JOIN inventory inv ON inv.product_id = p.id
      LEFT JOIN (
        SELECT oi.product_id, SUM(oi.quantity) AS total_qty, COUNT(DISTINCT o.id) AS order_count
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ('paid','shipping','shipped','completed')
          AND o.created_at >= ?
        GROUP BY oi.product_id
      ) s30 ON s30.product_id = p.id
      LEFT JOIN (
        SELECT oi.product_id, SUM(oi.quantity) AS total_qty
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ('paid','shipping','shipped','completed')
          AND o.created_at >= ?
        GROUP BY oi.product_id
      ) s14 ON s14.product_id = p.id
      LEFT JOIN (
        SELECT oi.product_id, SUM(oi.quantity) AS total_qty
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ('paid','shipping','shipped','completed')
          AND o.created_at >= ?
        GROUP BY oi.product_id
      ) s7 ON s7.product_id = p.id
      WHERE p.status = 1 ${productFilter}
      ORDER BY COALESCE(s7.total_qty, 0) / 7 DESC
    `;

    const allParams = [date30, date14, date7, ...params];
    const rows: any[] = await this.dataSource.query(sql, allParams);

    const forecasts = rows.map((row) => {
      const avgDailySales7 = +(row.totalSales7 / 7).toFixed(2);
      const avgDailySales14 = +(row.totalSales14 / 14).toFixed(2);
      const avgDailySales30 = +(row.totalSales30 / 30).toFixed(2);
      const available = row.currentStock - row.lockedQuantity;
      const daysOfStockLeft = avgDailySales7 > 0 ? Math.floor(available / avgDailySales7) : 9999;
      const predictedDemand = +(avgDailySales7 * leadTime).toFixed(0);
      const safetyStock = +(avgDailySales7 * safetyStockDays).toFixed(0);
      const recommendedReorder = Math.max(0, Math.ceil(predictedDemand + safetyStock - available));
      const orderCount = +row.orderCount30;
      const confidence = orderCount >= 30 ? 'high' : orderCount >= 10 ? 'medium' : 'low';

      return {
        productId: row.productId,
        productName: row.productName,
        productSku: row.productSku,
        currentStock: +row.currentStock,
        avgDailySales7,
        avgDailySales14,
        avgDailySales30,
        predictedDemand: +predictedDemand,
        daysOfStockLeft,
        recommendedReorder,
        confidence,
      };
    });

    let filtered = forecasts;
    if (onlyLowStock === 'true') {
      filtered = forecasts.filter((f) => f.daysOfStockLeft <= leadTime);
    }

    filtered.sort((a, b) => a.daysOfStockLeft - b.daysOfStockLeft);

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + +pageSize);

    return {
      items,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getForecastByProduct(productId: number, leadTime = 7, safetyStockDays = 3) {
    const result = await this.getForecastList({
      page: 1,
      pageSize: 99999,
      leadTime,
      safetyStockDays,
    } as any);
    const item = result.items.find((f: any) => f.productId === productId);
    return item || null;
  }

  async getSummary(leadTime = 7) {
    const result = await this.getForecastList({
      page: 1,
      pageSize: 99999,
      leadTime,
      safetyStockDays: 3,
    } as any);

    const items = result.items as any[];
    const needReorder = items.filter((f) => f.recommendedReorder > 0).length;
    const avgDaysOfStock =
      items.length > 0
        ? +(items.reduce((sum, f) => sum + Math.min(f.daysOfStockLeft, 9999), 0) / items.length).toFixed(1)
        : 0;

    return {
      totalProducts: items.length,
      needReorder,
      avgDaysOfStock,
    };
  }
}
