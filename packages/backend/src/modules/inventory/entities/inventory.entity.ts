import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', unique: true })
  productId: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ name: 'locked_quantity', default: 0 })
  lockedQuantity: number;

  @Column({ name: 'warning_threshold', default: 10 })
  warningThreshold: number;

  @Column({ default: 0 })
  version: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
