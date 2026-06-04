import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChannelOrder } from './channel-order.entity';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['taobao', 'jd', 'pdd', 'douyin', 'weixin', 'self'],
  })
  platform: string;

  @Column({ name: 'app_key', length: 200 })
  appKey: string;

  @Column({ name: 'app_secret', length: 200 })
  appSecret: string;

  @Column({ default: 1 })
  status: number;

  @Column({ name: 'sync_enabled', type: 'boolean', default: true })
  syncEnabled: boolean;

  @Column({ name: 'last_sync_at', type: 'datetime', nullable: true })
  lastSyncAt: Date;

  @Column({ name: 'webhook_url', length: 500, nullable: true })
  webhookUrl: string;

  @OneToMany(() => ChannelOrder, (co) => co.channel)
  orders: ChannelOrder[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
