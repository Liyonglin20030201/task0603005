import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ABTest } from './ab-test.entity';
import { ABTestVariant } from './ab-test-variant.entity';

@Entity('ab_test_events')
export class ABTestEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'test_id' })
  testId: number;

  @Column({ name: 'variant_id' })
  variantId: number;

  @Column({ name: 'event_type', length: 50 })
  eventType: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column({ name: 'session_id', length: 100 })
  sessionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value: number | null;

  @Column({ type: 'json', nullable: true })
  metadata: object | null;

  @ManyToOne(() => ABTest)
  @JoinColumn({ name: 'test_id' })
  test: ABTest;

  @ManyToOne(() => ABTestVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ABTestVariant;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
