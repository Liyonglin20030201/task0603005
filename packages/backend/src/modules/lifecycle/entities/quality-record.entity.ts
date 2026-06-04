import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('quality_records')
export class QualityRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'batch_id', nullable: true })
  batchId: number;

  @Column({ name: 'check_type', length: 50 })
  checkType: string;

  @Column({
    type: 'enum',
    enum: ['passed', 'failed', 'conditional'],
  })
  result: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ length: 100 })
  inspector: string;

  @Column({ name: 'check_items', type: 'json' })
  checkItems: Array<{ item: string; standard: string; actual: string; passed: boolean }>;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'json', nullable: true })
  attachments: string[];

  @Column({ name: 'checked_at', type: 'datetime' })
  checkedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
