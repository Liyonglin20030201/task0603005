import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { MarkReadDto } from './dto/mark-read.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepo.create({
      ...dto,
      level: dto.level || 'info',
    });
    return this.notificationRepo.save(notification);
  }

  async findAll(adminId: number, query: QueryNotificationDto) {
    const { page = 1, pageSize = 10, type, level, isRead, startDate, endDate } = query;

    const qb = this.notificationRepo.createQueryBuilder('n');
    qb.where('(n.recipient_id = :adminId OR n.recipient_id IS NULL)', { adminId });

    if (type) {
      qb.andWhere('n.type = :type', { type });
    }
    if (level) {
      qb.andWhere('n.level = :level', { level });
    }
    if (isRead !== undefined) {
      qb.andWhere('n.is_read = :isRead', { isRead: isRead === 'true' });
    }
    if (startDate) {
      qb.andWhere('n.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('n.created_at <= :endDate', { endDate: endDate + ' 23:59:59' });
    }

    qb.orderBy('n.created_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUnreadCount(adminId: number): Promise<number> {
    return this.notificationRepo.count({
      where: [
        { recipientId: adminId, isRead: false },
        { recipientId: null as any, isRead: false },
      ],
    });
  }

  async markRead(adminId: number, dto: MarkReadDto): Promise<void> {
    await this.notificationRepo
      .createQueryBuilder()
      .update()
      .set({ isRead: true })
      .where('id IN (:...ids)', { ids: dto.ids })
      .andWhere('(recipient_id = :adminId OR recipient_id IS NULL)', { adminId })
      .execute();
  }

  async markAllRead(adminId: number): Promise<void> {
    await this.notificationRepo
      .createQueryBuilder()
      .update()
      .set({ isRead: true })
      .where('(recipient_id = :adminId OR recipient_id IS NULL)', { adminId })
      .andWhere('is_read = :isRead', { isRead: false })
      .execute();
  }

  async remove(id: number): Promise<void> {
    await this.notificationRepo.delete(id);
  }
}
