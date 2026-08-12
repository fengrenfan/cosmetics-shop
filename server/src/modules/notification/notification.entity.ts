import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('notification')
@Index('idx_notif_user', ['user_id'])
@Index('idx_notif_read', ['is_read'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ length: 30 })
  type: string; // order_paid, order_shipped, order_completed, review_reply, after_sale, system

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true, name: 'ref_type' })
  ref_type: string; // order, after_sale, review

  @Column({ nullable: true, name: 'ref_id' })
  ref_id: number;

  @Column({ default: 0, name: 'is_read' })
  is_read: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
