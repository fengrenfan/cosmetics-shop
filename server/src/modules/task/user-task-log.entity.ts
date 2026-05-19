import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('user_task_log')
@Index('uk_user_task_period', ['user_id', 'task_type', 'period_key'], { unique: true })
export class UserTaskLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ length: 32, name: 'task_type' })
  task_type: string;

  @Column({ length: 32, name: 'period_key' })
  period_key: string;

  @Column({ nullable: true, name: 'ref_id' })
  ref_id: number;

  @Column({ type: 'int', default: 10 })
  points: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
