import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CampaignProduct } from './campaign-product.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: ['flash_sale', 'bundle', 'discount', 'free_shipping'] })
  type: string;

  @Column({ type: 'enum', enum: ['draft', 'active', 'paused', 'ended'], default: 'draft' })
  status: string;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ type: 'json', nullable: true })
  rules: object;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @Column({ name: 'used_budget', type: 'decimal', precision: 12, scale: 2, default: 0 })
  usedBudget: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => CampaignProduct, (cp) => cp.campaign)
  products: CampaignProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
