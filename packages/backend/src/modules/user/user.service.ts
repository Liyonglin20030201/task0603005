import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(createDto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { username: createDto.username } });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }
    const hashedPassword = await bcrypt.hash(createDto.password, 10);
    const user = this.userRepo.create({ ...createDto, password: hashedPassword });
    const saved = await this.userRepo.save(user);
    const { password, ...result } = saved as any;
    return result;
  }

  async findAll(query: QueryUserDto) {
    const { page, pageSize, sortBy, sortOrder, username, phone, email, status, gender } = query;
    const qb = this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.nickname',
        'user.email',
        'user.phone',
        'user.avatar',
        'user.gender',
        'user.status',
        'user.createdAt',
        'user.updatedAt',
      ]);

    if (username) {
      qb.andWhere('user.username LIKE :username', { username: `%${username}%` });
    }
    if (phone) {
      qb.andWhere('user.phone = :phone', { phone });
    }
    if (email) {
      qb.andWhere('user.email = :email', { email });
    }
    if (status !== undefined) {
      qb.andWhere('user.status = :status', { status });
    }
    if (gender !== undefined) {
      qb.andWhere('user.gender = :gender', { gender });
    }

    qb.orderBy(`user.${sortBy || 'createdAt'}`, sortOrder || 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const { password, ...result } = user as any;
    return result;
  }

  async update(id: number, updateDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }
    Object.assign(user, updateDto);
    const saved = await this.userRepo.save(user);
    const { password, ...result } = saved as any;
    return result;
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    await this.userRepo.remove(user);
  }
}
