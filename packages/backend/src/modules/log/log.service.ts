import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from './entities/operation-log.entity';
import { QueryLogDto } from './dto/query-log.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(OperationLog)
    private logRepo: Repository<OperationLog>,
  ) {}

  async findAll(query: QueryLogDto) {
    const { page, pageSize, sortBy, sortOrder, module, action, adminId, startDate, endDate } =
      query;
    const qb = this.logRepo.createQueryBuilder('log');

    if (module) {
      qb.andWhere('log.module = :module', { module });
    }
    if (action) {
      qb.andWhere('log.action = :action', { action });
    }
    if (adminId) {
      qb.andWhere('log.adminId = :adminId', { adminId });
    }
    if (startDate) {
      qb.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('log.createdAt <= :endDate', { endDate });
    }

    qb.orderBy(`log.${sortBy || 'createdAt'}`, sortOrder || 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
