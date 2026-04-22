import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../product/product.entity';
import { ProductSku } from '../product/product-sku.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  user_id: number;

  @Column({ name: 'device_id', nullable: true })
  device_id: string;

  @Column({ name: 'product_id' })
  product_id: number;

  @Column({ nullable: true, name: 'sku_id' })
  sku_id: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ default: 1, name: 'is_checked' })
  is_checked: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductSku)
  @JoinColumn({ name: 'sku_id' })
  sku: ProductSku;
}
