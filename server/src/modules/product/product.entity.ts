import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ProductSku } from './product-sku.entity';
import { Category } from '../category/category.entity';

@Entity('product')
@Index('idx_product_status', ['status'])
@Index('idx_product_category_id', ['category_id'])
@Index('idx_product_is_recommend', ['is_recommend'])
@Index('idx_product_is_hot', ['is_hot'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_id' })
  category_id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 500, nullable: true })
  subtitle: string;

  @Column({ length: 512 })
  cover_image: string;

  @Column({ type: 'text', nullable: true })
  images: any;

  @Column({ type: 'text', nullable: true })
  detail_html: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'original_price' })
  original_price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0, name: 'sales_count' })
  sales_count: number;

  @Column({ default: 0, name: 'view_count' })
  view_count: number;

  @Column({ default: 0, name: 'is_recommend' })
  is_recommend: number;

  @Column({ default: 0, name: 'is_hot' })
  is_hot: number;

  @Column({ default: 0, name: 'is_new' })
  is_new: number;

  @Column({ default: 1 })
  status: number;

  @Column({ default: 0, name: 'sort_order' })
  sort_order: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductSku, (sku) => sku.product)
  skus: ProductSku[];

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0, name: 'avg_rating' })
  avg_rating: number;

  @Column({ default: 0, name: 'review_count' })
  review_count: number;
}
