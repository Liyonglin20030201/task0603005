import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
  ) {}

  async create(createDto: CreateProductDto) {
    const existing = await this.productRepo.findOne({ where: { sku: createDto.sku } });
    if (existing) {
      throw new ConflictException('SKU已存在');
    }

    const product = this.productRepo.create(createDto);
    const saved = await this.productRepo.save(product);

    // Create inventory record with quantity=0
    const inventory = this.inventoryRepo.create({ productId: saved.id, quantity: 0 });
    await this.inventoryRepo.save(inventory);

    return saved;
  }

  async findAll(query: QueryProductDto) {
    const { page, pageSize, sortBy, sortOrder, name, categoryId, status, minPrice, maxPrice } = query;
    const qb = this.productRepo.createQueryBuilder('product');

    if (name) {
      qb.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }
    if (categoryId !== undefined) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (status !== undefined) {
      qb.andWhere('product.status = :status', { status });
    }
    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    qb.orderBy(`product.${sortBy || 'createdAt'}`, sortOrder || 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    return product;
  }

  async update(id: number, updateDto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, updateDto);
    return this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    const orderCount = await this.orderItemRepo.count({ where: { productId: id } });
    if (orderCount > 0) {
      // Has orders, just set status to 0 (soft-remove)
      product.status = 0;
      return this.productRepo.save(product);
    }

    await this.productRepo.remove(product);
  }
}
