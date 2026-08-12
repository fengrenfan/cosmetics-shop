import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';

@Entity('review')
@Index('idx_review_product', ['product_id'])
@Index('idx_review_user', ['user_id'])
@Index('idx_review_order', ['order_id'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'product_id' })
  product_id: number;

  @Column({ name: 'order_id' })
  order_id: number;

  @Column({ type: 'tinyint', default: 5 })
  rating: number; // 1-5 星

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'json', nullable: true, name: 'sku_info' })
  sku_info: any;

  @Column({ default: 0, name: 'is_anonymous' })
  is_anonymous: number;

  @Column({ default: 0, name: 'is_top' })
  is_top: number;

  @Column({ default: 1 })
  status: number; // 0=待审核 1=已通过 2=已拒绝

  @Column({ type: 'text', nullable: true, name: 'admin_reply' })
  admin_reply: string;

  @Column({ type: 'datetime', nullable: true, name: 'reply_time' })
  reply_time: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
