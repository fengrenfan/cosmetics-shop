import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { Order } from '../order/order.entity';

@Entity('after_sale')
@Index('idx_as_user', ['user_id'])
@Index('idx_as_order', ['order_id'])
@Index('idx_as_status', ['status'])
export class AfterSale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, name: 'refund_no' })
  refund_no: string;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'order_id' })
  order_id: number;

  @Column({ type: 'json', nullable: true, name: 'order_item_ids' })
  order_item_ids: number[];

  @Column({ length: 20 })
  type: string; // refund=仅退款, return=退货退款

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'refund_amount' })
  refund_amount: number;

  @Column({ length: 50 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ length: 20, default: 'pending' })
  status: string; // pending/approved/rejected/refunding/refunded

  @Column({ type: 'text', nullable: true, name: 'admin_remark' })
  admin_remark: string;

  @Column({ type: 'datetime', nullable: true, name: 'process_time' })
  process_time: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
