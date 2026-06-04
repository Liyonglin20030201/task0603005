import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Channel } from './channel.entity';

@Entity('channel_orders')
export class ChannelOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'channel_id' })
  channelId: number;

  @Column({
    type: 'enum',
    enum: ['taobao', 'jd', 'pdd', 'douyin', 'weixin', 'self'],
  })
  platform: string;

  @Column({ name: 'platform_order_no', length: 100, unique: true })
  platformOrderNo: string;

  @Column({ name: 'local_order_id', nullable: true })
  localOrderId: number;

  @Column({ name: 'local_order_no', length: 32, nullable: true })
  localOrderNo: string | null;

  @Column({ name: 'buyer_nickname', length: 100 })
  buyerNickname: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'pay_amount', type: 'decimal', precision: 10, scale: 2 })
  payAmount: number;

  @Column({ name: 'item_count', default: 1 })
  itemCount: number;

  @Column({ type: 'json', nullable: true })
  items: object[];

  @Column({ name: 'platform_status', length: 50 })
  platformStatus: string;

  @Column({
    name: 'sync_status',
    type: 'enum',
    enum: ['pending', 'synced', 'failed'],
    default: 'pending',
  })
  syncStatus: string;

  @Column({ name: 'synced_at', type: 'datetime', nullable: true })
  syncedAt: Date;

  @Column({ name: 'fail_reason', type: 'text', nullable: true })
  failReason: string | null;

  @Column({ name: 'platform_created_at', type: 'datetime' })
  platformCreatedAt: Date;

  @Column({ name: 'raw_data', type: 'json', nullable: true })
  rawData: object;

  @ManyToOne(() => Channel, (c) => c.orders)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
