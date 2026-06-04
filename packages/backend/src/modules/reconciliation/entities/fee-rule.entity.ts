import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('fee_rules')
export class FeeRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  platform: string;

  @Column({
    name: 'fee_type',
    type: 'enum',
    enum: ['platform_commission', 'payment_fee', 'shipping_fee', 'refund_fee', 'promotion_fee', 'service_fee'],
  })
  feeType: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  rate: number;

  @Column({ name: 'fixed_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  fixedAmount: number;

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minAmount: number;

  @Column({ name: 'max_amount', type: 'decimal', precision: 10, scale: 2, default: 99999 })
  maxAmount: number;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
