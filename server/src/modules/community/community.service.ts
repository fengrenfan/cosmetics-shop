import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityLike } from './community-like.entity';
import { CommunityPost } from './community-post.entity';
import { CreateCommunityPostDto } from './community.dto';
import { TaskService } from '../task/task.service';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPost)
    private readonly postRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityLike)
    private readonly likeRepository: Repository<CommunityLike>,
    private readonly taskService: TaskService,
  ) {}

  async getList(userId: number, page = 1, pageSize = 10) {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { status: 1 },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const likedRows = posts.length
      ? await this.likeRepository.find({
          where: posts.map((post) => ({ post_id: post.id, user_id: userId })),
        })
      : [];
    const likedIds = new Set(likedRows.map((like) => like.post_id));

    return {
      list: posts.map((post) => ({
        id: post.id,
        content: post.content,
        images: post.images || [],
        like_count: post.like_count,
        is_liked: likedIds.has(post.id),
        created_at: post.created_at,
        user: {
          id: post.user?.id,
          nickname: post.user?.nickname || '美妆用户',
          avatar: post.user?.avatar || '',
        },
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async create(userId: number, dto: CreateCommunityPostDto) {
    const post = this.postRepository.create({
      user_id: userId,
      content: dto.content.trim(),
      images: dto.images || [],
    });
    const saved = await this.postRepository.save(post);
    await this.taskService.onCommunityPost(userId);
    return saved;
  }

  async toggleLike(userId: number, postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId, status: 1 } });
    if (!post) {
      throw new NotFoundException('动态不存在');
    }

    const existing = await this.likeRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existing) {
      await this.likeRepository.delete(existing.id);
      await this.postRepository.decrement({ id: postId }, 'like_count', 1);
      return { is_liked: false, like_count: Math.max(post.like_count - 1, 0) };
    }

    await this.likeRepository.save(this.likeRepository.create({ post_id: postId, user_id: userId }));
    await this.postRepository.increment({ id: postId }, 'like_count', 1);
    return { is_liked: true, like_count: post.like_count + 1 };
  }
}
