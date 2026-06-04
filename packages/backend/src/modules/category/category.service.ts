import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(createDto: CreateCategoryDto) {
    const category = this.categoryRepo.create(createDto);
    return this.categoryRepo.save(category);
  }

  async findAll(tree?: boolean) {
    const categories = await this.categoryRepo.find({ order: { sort: 'ASC', createdAt: 'DESC' } });
    if (tree) {
      return this.buildTree(categories);
    }
    return categories;
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  async update(id: number, updateDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, updateDto);
    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);

    const childCount = await this.categoryRepo.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException('该分类下存在子分类，无法删除');
    }

    const productCount = await this.productRepo.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new BadRequestException('该分类下存在商品，无法删除');
    }

    await this.categoryRepo.remove(category);
  }

  private buildTree(categories: Category[]): Category[] {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parentId === 0) {
        roots.push(node);
      } else {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children!.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  }
}
