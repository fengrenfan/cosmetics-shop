import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('payment_record')
@Unique('uk_out_trade_no', ['out_trade_no'])
@Index('idx_order', ['order_id'])
@Index('idx_user', ['user_id'])
export class PaymentRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  order_id: number;

  @Column({ length: 64, name: 'order_no' })
  order_no: string;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ length: 20, name: 'pay_channel' })
  pay_channel: string; // wechat | alipay

  @Column({ length: 20, name: 'pay_scene' })
  pay_scene: string; // miniapp | h5

  @Column({ length: 20, default: 'paying' })
  status: string; // paying | paid | failed | closed

  @Column({ length: 64, name: 'out_trade_no' })
  out_trade_no: string;

  @Column({ length: 64, nullable: true, name: 'third_trade_no' })
  third_trade_no: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount' })
  amount: number;

  @Column({ type: 'text', nullable: true, name: 'client_payload' })
  client_payload: string;

  @Column({ type: 'text', nullable: true, name: 'notify_payload' })
  notify_payload: string;

  @Column({ type: 'datetime', nullable: true, name: 'paid_at' })
  paid_at: Date;

  @Column({ type: 'datetime', nullable: true, name: 'notify_at' })
  notify_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
