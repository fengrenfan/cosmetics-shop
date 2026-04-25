import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('order')
@Index('idx_pay_status', ['pay_status'])
@Index('idx_out_trade_no', ['out_trade_no'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, name: 'order_no' })
  order_no: string;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  total_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'freight_amount' })
  freight_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'pay_amount' })
  pay_amount: number;

  @Column({ type: 'datetime', nullable: true, name: 'pay_time' })
  pay_time: Date;

  @Column({ length: 20, nullable: true, name: 'pay_channel' })
  pay_channel: string; // wechat | alipay

  @Column({ length: 20, nullable: true, name: 'pay_scene' })
  pay_scene: string; // miniapp | h5

  @Column({ length: 20, default: 'unpaid', name: 'pay_status' })
  pay_status: string; // unpaid | paying | paid | failed | closed | refunding | refunded

  @Column({ length: 64, nullable: true, name: 'out_trade_no' })
  out_trade_no: string;

  @Column({ length: 64, nullable: true, name: 'third_trade_no' })
  third_trade_no: string;

  @Column({ type: 'datetime', nullable: true, name: 'paid_at' })
  paid_at: Date;

  @Column({ type: 'datetime', nullable: true, name: 'notify_at' })
  notify_at: Date;

  @Column({ length: 255, nullable: true, name: 'pay_fail_reason' })
  pay_fail_reason: string;

  @Column({ type: 'text', nullable: true, name: 'notify_payload' })
  notify_payload: string;

  @Column({ type: 'datetime', nullable: true, name: 'ship_time' })
  ship_time: Date;

  @Column({ type: 'datetime', nullable: true, name: 'receive_time' })
  receive_time: Date;

  @Column({ type: 'datetime', nullable: true, name: 'complete_time' })
  complete_time: Date;

  @Column({ nullable: true, name: 'address_id' })
  address_id: number;

  @Column({ type: 'text', nullable: true, name: 'address_snapshot' })
  address_snapshot: any;

  @Column({ length: 512, nullable: true })
  remark: string;

  @Column({ length: 50, nullable: true, name: 'express_company' })
  express_company: string;

  @Column({ length: 100, nullable: true, name: 'express_no' })
  express_no: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'coupon_amount' })
  coupon_amount: number;

  @Column({ nullable: true, name: 'coupon_id' })
  coupon_id: number;

  @Column({ type: 'datetime', nullable: true, name: 'cancel_time' })
  cancel_time: Date;

  @Column({ length: 255, nullable: true, name: 'cancel_reason' })
  cancel_reason: string;

  @Column({ type: 'int', default: 0, name: 'points_amount' })
  points_amount: number; // 使用积分抵扣的积分数量

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'points_money' })
  points_money: number; // 使用积分抵扣的金额

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
