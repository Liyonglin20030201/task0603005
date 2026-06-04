import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Reconciliation } from './reconciliation.entity';

@Entity('reconciliation_details')
export class ReconciliationDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reconciliation_id' })
  reconciliationId: number;

  @Column({ name: 'platform_order_no', length: 100 })
  platformOrderNo: string;

  @Column({ name: 'local_order_no', length: 100, nullable: true })
  localOrderNo: string;

  @Column({ name: 'platform_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformAmount: number;

  @Column({ name: 'local_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  localAmount: number;

  @Column({ name: 'difference_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  differenceAmount: number;

  @Column({ name: 'difference_reason', type: 'text', nullable: true })
  differenceReason: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'matched', 'discrepancy', 'resolved'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @ManyToOne(() => Reconciliation, (r) => r.details)
  @JoinColumn({ name: 'reconciliation_id' })
  reconciliation: Reconciliation;
}
