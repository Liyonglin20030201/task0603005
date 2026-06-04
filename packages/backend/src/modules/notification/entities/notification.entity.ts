import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['system', 'inventory_warning', 'order', 'campaign'] })
  type: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['info', 'warning', 'error'], default: 'info' })
  level: string;

  @Column({ name: 'recipient_id', nullable: true })
  recipientId: number;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
