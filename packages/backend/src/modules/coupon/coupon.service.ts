import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { UserCoupon } from './entities/user-coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { QueryCouponDto } from './dto/query-coupon.dto';
import { DistributeCouponDto } from './dto/distribute-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepo: Repository<UserCoupon>,
  ) {}

  async create(createDto: CreateCouponDto) {
    const coupon = this.couponRepo.create(createDto);
    return this.couponRepo.save(coupon);
  }

  async findAll(query: QueryCouponDto) {
    const { page, pageSize, sortBy, sortOrder, name, type, status } = query;
    const qb = this.couponRepo.createQueryBuilder('coupon');

    if (name) {
      qb.andWhere('coupon.name LIKE :name', { name: `%${name}%` });
    }
    if (type) {
      qb.andWhere('coupon.type = :type', { type });
    }
    if (status !== undefined) {
      qb.andWhere('coupon.status = :status', { status });
    }

    qb.orderBy(`coupon.${sortBy || 'createdAt'}`, sortOrder || 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }
    return coupon;
  }

  async update(id: number, updateDto: UpdateCouponDto) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }
    Object.assign(coupon, updateDto);
    return this.couponRepo.save(coupon);
  }

  async remove(id: number) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }
    if (coupon.usedCount > 0) {
      throw new BadRequestException('优惠券已被使用，无法删除');
    }
    await this.couponRepo.remove(coupon);
  }

  async distribute(distributeDto: DistributeCouponDto) {
    const { couponId, userIds } = distributeDto;
    const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }
    const remaining = coupon.totalCount - coupon.usedCount;
    if (remaining < userIds.length) {
      throw new BadRequestException(`优惠券库存不足，剩余 ${remaining} 张`);
    }

    const userCoupons = userIds.map((userId) =>
      this.userCouponRepo.create({ userId, couponId }),
    );
    await this.userCouponRepo.save(userCoupons);

    coupon.usedCount += userIds.length;
    await this.couponRepo.save(coupon);

    return { distributed: userIds.length };
  }

  async getUserCoupons(userId: number) {
    return this.userCouponRepo.find({ where: { userId } });
  }
}
