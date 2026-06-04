import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  async create(createDto: CreateRoleDto) {
    const existing = await this.roleRepo.findOne({
      where: [{ name: createDto.name }, { code: createDto.code }],
    });
    if (existing) {
      throw new ConflictException('角色名或编码已存在');
    }
    const role = this.roleRepo.create(createDto);
    return this.roleRepo.save(role);
  }

  async findAll(query: QueryRoleDto) {
    const { page, pageSize, sortBy, sortOrder, name, status } = query;
    const qb = this.roleRepo.createQueryBuilder('role');

    if (name) {
      qb.andWhere('role.name LIKE :name', { name: `%${name}%` });
    }
    if (status !== undefined) {
      qb.andWhere('role.status = :status', { status });
    }

    qb.orderBy(`role.${sortBy || 'createdAt'}`, sortOrder || 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('角色不存在');
    return role;
  }

  async update(id: number, updateDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    Object.assign(role, updateDto);
    return this.roleRepo.save(role);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    await this.roleRepo.remove(role);
  }
}
