import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ABTest } from './ab-test.entity';

@Entity('ab_test_variants')
export class ABTestVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'test_id' })
  testId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'traffic_percent', type: 'int' })
  trafficPercent: number;

  @Column({ name: 'is_control', type: 'boolean', default: false })
  isControl: boolean;

  @Column({ type: 'json', nullable: true })
  config: object;

  @Column({ type: 'int', default: 0 })
  impressions: number;

  @Column({ type: 'int', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  revenue: number;

  @ManyToOne(() => ABTest, (t) => t.variants)
  @JoinColumn({ name: 'test_id' })
  test: ABTest;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
