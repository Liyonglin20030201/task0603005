import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ABTestVariant } from './ab-test-variant.entity';

@Entity('ab_tests')
export class ABTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: ['price', 'page_layout', 'promotion', 'copy', 'image', 'recommendation'] })
  type: string;

  @Column({ type: 'enum', enum: ['draft', 'running', 'paused', 'completed', 'archived'], default: 'draft' })
  status: string;

  @Column({ type: 'text' })
  hypothesis: string;

  @Column({ name: 'primary_metric', type: 'enum', enum: ['conversion_rate', 'click_rate', 'revenue', 'aov', 'bounce_rate', 'engagement'] })
  primaryMetric: string;

  @Column({ name: 'secondary_metrics', type: 'json', nullable: true })
  secondaryMetrics: string[];

  @Column({ name: 'start_date', type: 'datetime', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'datetime', nullable: true })
  endDate: Date | null;

  @Column({ name: 'target_sample_size', type: 'int', default: 1000 })
  targetSampleSize: number;

  @Column({ name: 'current_sample_size', type: 'int', default: 0 })
  currentSampleSize: number;

  @Column({ name: 'confidence_level', type: 'decimal', precision: 3, scale: 2, default: 0.95 })
  confidenceLevel: number;

  @Column({ name: 'winner_variant_id', type: 'int', nullable: true })
  winnerVariantId: number | null;

  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @OneToMany(() => ABTestVariant, (v) => v.test)
  variants: ABTestVariant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
