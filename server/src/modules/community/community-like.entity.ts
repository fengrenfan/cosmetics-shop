import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from '../user/user.entity';
import { CommunityPost } from './community-post.entity';

@Entity('community_like')
export class CommunityLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id' })
  post_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => CommunityPost)
  @JoinColumn({ name: 'post_id' })
  post: CommunityPost;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
