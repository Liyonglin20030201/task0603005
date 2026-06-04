import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('product_lifecycles')
export class ProductLifecycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', unique: true })
  productId: number;

  @Column({
    name: 'current_stage',
    type: 'enum',
    enum: ['development', 'testing', 'pre_sale', 'on_sale', 'promotion', 'clearance', 'discontinued'],
    default: 'development',
  })
  currentStage: string;

  @Column({ name: 'stage_history', type: 'json' })
  stageHistory: Array<{ stage: string; enteredAt: string; operatorId: number; remark?: string }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
