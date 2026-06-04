import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ReconciliationDetail } from './reconciliation-detail.entity';

@Entity('reconciliations')
export class Reconciliation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  platform: string;

  @Column({ name: 'period_start', type: 'date' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: Date;

  @Column({ name: 'total_orders', default: 0 })
  totalOrders: number;

  @Column({ name: 'matched_orders', default: 0 })
  matchedOrders: number;

  @Column({ name: 'discrepancy_orders', default: 0 })
  discrepancyOrders: number;

  @Column({ name: 'platform_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  platformAmount: number;

  @Column({ name: 'local_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  localAmount: number;

  @Column({ name: 'difference_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  differenceAmount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'matched', 'discrepancy', 'resolved'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'reconciled_at', type: 'datetime', nullable: true })
  reconciledAt: Date;

  @Column({ name: 'operator_id', nullable: true })
  operatorId: number;

  @OneToMany(() => ReconciliationDetail, (d) => d.reconciliation)
  details: ReconciliationDetail[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
