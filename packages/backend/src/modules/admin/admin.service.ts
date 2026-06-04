import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryAdminDto } from './dto/query-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
  ) {}

  async create(createDto: CreateAdminDto) {
    const existing = await this.adminRepo.findOne({ where: { username: createDto.username } });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }
    const hashedPassword = await bcrypt.hash(createDto.password, 10);
    const admin = this.adminRepo.create({ ...createDto, password: hashedPassword });
    const saved = await this.adminRepo.save(admin);
    const { password, ...result } = saved as any;
    return result;
  }

  async findAll(query: QueryAdminDto) {
    const { page, pageSize, sortBy, sortOrder, username, status, roleId } = query;
    const qb = this.adminRepo
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.role', 'role')
      .select([
        'admin.id',
        'admin.username',
        'admin.nickname',
        'admin.email',
        'admin.phone',
        'admin.avatar',
        'admin.roleId',
        'admin.status',
        'admin.lastLoginAt',
        'admin.createdAt',
        'role.id',
        'role.name',
        'role.code',
      ]);

    if (username) {
      qb.andWhere('admin.username LIKE :username', { username: `%${username}%` });
    }
    if (status !== undefined) {
      qb.andWhere('admin.status = :status', { status });
    }
    if (roleId) {
      qb.andWhere('admin.roleId = :roleId', { roleId });
    }

    qb.orderBy(`admin.${sortBy || 'createdAt'}`, sortOrder || 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const admin = await this.adminRepo.findOne({ where: { id }, relations: ['role'] });
    if (!admin) {
      throw new NotFoundException('管理员不存在');
    }
    const { password, ...result } = admin as any;
    return result;
  }

  async update(id: number, updateDto: UpdateAdminDto) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('管理员不存在');
    }
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }
    Object.assign(admin, updateDto);
    const saved = await this.adminRepo.save(admin);
    const { password, ...result } = saved as any;
    return result;
  }

  async remove(id: number) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('管理员不存在');
    }
    await this.adminRepo.remove(admin);
  }
}
