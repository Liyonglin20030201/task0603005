import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settlements')
export class Settlement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  platform: string;

  @Column({ name: 'settlement_no', length: 100, unique: true })
  settlementNo: string;

  @Column({ name: 'period_start', type: 'date' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: Date;

  @Column({ name: 'gross_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  grossAmount: number;

  @Column({ name: 'total_fees', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalFees: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  netAmount: number;

  @Column({ name: 'order_count', default: 0 })
  orderCount: number;

  @Column({ name: 'refund_count', default: 0 })
  refundCount: number;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  refundAmount: number;

  @Column({ name: 'fee_breakdown', type: 'json', nullable: true })
  feeBreakdown: { type: string; amount: number; rate?: number }[];

  @Column({
    type: 'enum',
    enum: ['unsettled', 'settling', 'settled', 'disputed'],
    default: 'unsettled',
  })
  status: string;

  @Column({ name: 'settled_at', type: 'datetime', nullable: true })
  settledAt: Date | null;

  @Column({ name: 'bank_account', length: 200, nullable: true })
  bankAccount: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
