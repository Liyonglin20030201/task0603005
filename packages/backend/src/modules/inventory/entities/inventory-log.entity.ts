import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('inventory_logs')
export class InventoryLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'enum', enum: ['in', 'out', 'lock', 'unlock', 'adjust'] })
  type: string;

  @Column()
  quantity: number;

  @Column({ name: 'before_quantity' })
  beforeQuantity: number;

  @Column({ name: 'after_quantity' })
  afterQuantity: number;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @Column({ name: 'operator_id', nullable: true })
  operatorId: number;

  @Column({ length: 255, nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
