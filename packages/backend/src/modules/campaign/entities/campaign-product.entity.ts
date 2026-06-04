import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Campaign } from './campaign.entity';

@Entity('campaign_products')
@Unique(['campaignId', 'productId'])
export class CampaignProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'campaign_id' })
  campaignId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'campaign_price', type: 'decimal', precision: 10, scale: 2 })
  campaignPrice: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'sold_count', default: 0 })
  soldCount: number;

  @ManyToOne(() => Campaign, (c) => c.products)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;
}
