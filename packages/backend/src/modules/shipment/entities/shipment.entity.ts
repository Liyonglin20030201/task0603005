import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', unique: true })
  orderId: number;

  @Column({ name: 'tracking_no', length: 100 })
  trackingNo: string;

  @Column({ length: 100 })
  carrier: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'estimated_delivery', type: 'datetime', nullable: true })
  estimatedDelivery: Date;

  @Column({ name: 'status_history', type: 'json' })
  statusHistory: Array<{ status: string; location: string; time: string; description?: string; operatorId?: number | null }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
