import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityComment } from './community-comment.entity';
import { CommunityPost } from './community-post.entity';

@Injectable()
export class CommunityCommentService {
  constructor(
    @InjectRepository(CommunityComment)
    private readonly commentRepo: Repository<CommunityComment>,
    @InjectRepository(CommunityPost)
    private readonly postRepo: Repository<CommunityPost>,
  ) {}

  /**
   * 发表评论
   */
  async create(userId: number, postId: number, content: string, parentId?: number, replyUserId?: number) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('帖子不存在');

    const comment = this.commentRepo.create({
      post_id: postId,
      user_id: userId,
      content,
      parent_id: parentId || null,
      reply_user_id: replyUserId || null,
    });

    const saved = await this.commentRepo.save(comment);

    // 更新帖子评论数
    await this.postRepo
      .createQueryBuilder()
      .update()
      .set({ comment_count: () => 'comment_count + 1' })
      .where('id = :id', { id: postId })
      .execute();

    return saved;
  }

  /**
   * 获取帖子评论列表
   */
  async getByPost(postId: number, page = 1, limit = 20) {
    const [items, total] = await this.commentRepo.findAndCount({
      where: { post_id: postId, status: 1 },
      relations: ['user'],
      order: { created_at: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const list = items.map(item => ({
      id: item.id,
      content: item.content,
      parent_id: item.parent_id,
      reply_user_id: item.reply_user_id,
      created_at: item.created_at,
      user: {
        id: item.user?.id,
        nickname: item.user?.nickname || '用户',
        avatar: item.user?.avatar,
      },
    }));

    return { list, total, page, limit };
  }

  /**
   * 删除自己的评论
   */
  async delete(userId: number, commentId: number) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId, user_id: userId },
    });
    if (!comment) throw new NotFoundException('评论不存在');

    await this.commentRepo.remove(comment);

    // 更新帖子评论数
    await this.postRepo
      .createQueryBuilder()
      .update()
      .set({ comment_count: () => 'GREATEST(comment_count - 1, 0)' })
      .where('id = :id', { id: comment.post_id })
      .execute();

    return { success: true };
  }
}
