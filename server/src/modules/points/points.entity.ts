import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('point_log')
export class PointLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ type: 'tinyint' })
  type: number; // 1=收入, 2=支出, 3=过期

  @Column()
  points: number; // 积分数量（正数）

  @Column()
  balance: number; // 变动后余额

  @Column({ length: 20 })
  source: string; // order=订单, exchange=兑换, expire=过期

  @Column({ nullable: true, name: 'order_id' })
  order_id: number; // 关联订单ID

  @Column({ length: 255, nullable: true })
  remark: string; // 备注

  @Column({ type: 'datetime', nullable: true, name: 'expired_at' })
  expired_at: Date; // 过期时间（批次过期时间）

  @Column({ type: 'datetime', nullable: true, name: 'deducted_at' })
  deducted_at: Date; // 扣减时间（用于 FIFO 追踪）

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}