import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('user_coupons')
export class UserCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'coupon_id' })
  couponId: number;

  @Column({ type: 'enum', enum: ['unused', 'used', 'expired'], default: 'unused' })
  status: string;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  usedAt: Date;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
