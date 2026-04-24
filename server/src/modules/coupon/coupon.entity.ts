import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('coupon')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 20 })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'min_amount' })
  min_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'max_discount' })
  max_discount: number;

  @Column({ name: 'total_count' })
  total_count: number;

  @Column({ default: 0, name: 'used_count' })
  used_count: number;

  @Column({ default: 1, name: 'per_limit' })
  per_limit: number;

  @Column({ type: 'datetime', name: 'start_time' })
  start_time: Date;

  @Column({ type: 'datetime', name: 'end_time' })
  end_time: Date;

  @Column({ default: 1 })
  status: number;

  @Column({ default: 0, name: 'auto_grant' })
  auto_grant: number; // 0:否 1:新用户注册 2:首单

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

@Entity('user_coupon')
export class UserCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'coupon_id' })
  coupon_id: number;

  @Column({ length: 20, default: 'unused' })
  status: string;

  @Column({ type: 'datetime', name: 'claimed_at' })
  claimed_at: Date;

  @Column({ type: 'datetime', nullable: true, name: 'used_at' })
  used_at: Date;

  @Column({ nullable: true, name: 'order_id' })
  order_id: number;

  @Column({ length: 20, default: 'claim', name: 'source' })
  source: string; // 'claim'领取 'admin'管理员发放 'auto'自动发放

  @ManyToOne(() => Coupon)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;
}
