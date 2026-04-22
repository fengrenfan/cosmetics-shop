import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('product_recommend')
export class ProductRecommend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  product_id: number;

  @Column({ name: 'sort_order', default: 0 })
  sort_order: number;

  @Column({ default: 1 })
  status: number;

  @Column({ name: 'recommend_type', length: 20, default: 'home' })
  recommend_type: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
