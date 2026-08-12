import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('community_comment')
@Index('idx_cc_post', ['post_id'])
@Index('idx_cc_user', ['user_id'])
export class CommunityComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id' })
  post_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ nullable: true, name: 'parent_id' })
  parent_id: number;

  @Column({ nullable: true, name: 'reply_user_id' })
  reply_user_id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 1 })
  status: number; // 0=隐藏 1=正常

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
