import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('user_checkin')
@Index('uk_user_checkin_date', ['user_id', 'checkin_date'], { unique: true })
export class UserCheckin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ type: 'date', name: 'checkin_date' })
  checkin_date: string;

  @Column({ type: 'int', default: 10 })
  points: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
