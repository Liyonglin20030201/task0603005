import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('product_batches')
export class ProductBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'batch_no', unique: true, length: 100 })
  batchNo: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'remaining_quantity', type: 'int' })
  remainingQuantity: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2 })
  costPrice: number;

  @Column({ length: 200 })
  supplier: string;

  @Column({ name: 'production_date', type: 'date' })
  productionDate: string;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate: string;

  @Column({
    type: 'enum',
    enum: ['active', 'quarantine', 'recalled', 'expired', 'depleted'],
    default: 'active',
  })
  status: string;

  @Column({ name: 'quality_score', type: 'int', nullable: true })
  qualityScore: number;

  @Column({ name: 'trace_code', unique: true, length: 100 })
  traceCode: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
