import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto, AdminReviewQueryDto } from './review.dto';
import { Order } from '../order/order.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  /**
   * 用户提交评价
   */
  async create(userId: number, dto: CreateReviewDto) {
    // 校验订单属于该用户且已完成
    const order = await this.orderRepo.findOne({
      where: { id: dto.order_id, user_id: userId },
    });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 'completed') {
      throw new BadRequestException('只能评价已完成的订单');
    }

    // 检查是否已评价
    const existing = await this.reviewRepo.findOne({
      where: { user_id: userId, order_id: dto.order_id, product_id: dto.product_id },
    });
    if (existing) throw new BadRequestException('该商品已评价');

    const review = this.reviewRepo.create({
      user_id: userId,
      product_id: dto.product_id,
      order_id: dto.order_id,
      rating: dto.rating,
      content: dto.content || '',
      images: dto.images || [],
      is_anonymous: dto.is_anonymous || 0,
      status: 1, // 默认直接通过
    });

    const saved = await this.reviewRepo.save(review);

    // 更新商品评价统计
    await this.updateProductRating(dto.product_id);

    return saved;
  }

  /**
   * 获取商品评价列表 (公开)
   */
  async getByProduct(productId: number, page = 1, limit = 10, rating?: number) {
    const qb = this.reviewRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'u')
      .where('r.product_id = :productId', { productId })
      .andWhere('r.status = :status', { status: 1 })
      .orderBy('r.is_top', 'DESC')
      .addOrderBy('r.created_at', 'DESC');

    if (rating) {
      qb.andWhere('r.rating = :rating', { rating });
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // 处理匿名
    const list = items.map(item => ({
      ...item,
      user: item.is_anonymous
        ? { nickname: '匿名用户', avatar: null }
        : { nickname: item.user?.nickname || '用户', avatar: item.user?.avatar },
    }));

    return { list, total, page, limit };
  }

  /**
   * 商品评价统计
   */
  async getStats(productId: number) {
    const reviews = await this.reviewRepo.find({
      where: { product_id: productId, status: 1 },
      select: ['rating'],
    });

    const total = reviews.length;
    if (total === 0) {
      return { total, avg: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / total) * 10) / 10;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { distribution[r.rating]++; });

    return { total, avg, distribution };
  }

  /**
   * 查询订单中可评价的商品
   */
  async getReviewable(userId: number, orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user_id: userId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('订单不存在');

    const reviewed = await this.reviewRepo.find({
      where: { user_id: userId, order_id: orderId },
      select: ['product_id'],
    });
    const reviewedIds = new Set(reviewed.map(r => r.product_id));

    return {
      order_no: order.order_no,
      items: order.items.map(item => ({
        ...item,
        reviewed: reviewedIds.has(item.product_id),
      })),
    };
  }

  /**
   * 我的评价
   */
  async getMine(userId: number, page = 1, limit = 10) {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { user_id: userId },
      relations: ['product'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { list: items, total, page, limit };
  }

  /**
   * 管理后台 — 评价列表
   */
  async adminList(query: AdminReviewQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { status, product_id, keyword } = query;

    const qb = this.reviewRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'u')
      .leftJoinAndSelect('r.product', 'p');

    if (status !== undefined && status !== null) {
      qb.andWhere('r.status = :status', { status });
    }
    if (product_id) {
      qb.andWhere('r.product_id = :product_id', { product_id });
    }
    if (keyword) {
      qb.andWhere('(r.content LIKE :kw OR p.title LIKE :kw)', { kw: `%${keyword}%` });
    }

    qb.orderBy('r.created_at', 'DESC');

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { list: items, total, page, limit };
  }

  /**
   * 管理后台 — 审核通过
   */
  async approve(id: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('评价不存在');
    review.status = 1;
    await this.reviewRepo.save(review);
    await this.updateProductRating(review.product_id);
    return review;
  }

  /**
   * 管理后台 — 审核拒绝
   */
  async reject(id: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('评价不存在');
    review.status = 2;
    await this.reviewRepo.save(review);
    await this.updateProductRating(review.product_id);
    return review;
  }

  /**
   * 管理后台 — 回复评价
   */
  async reply(id: number, adminReply: string) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('评价不存在');
    review.admin_reply = adminReply;
    review.reply_time = new Date();
    return this.reviewRepo.save(review);
  }

  /**
   * 更新商品评价统计
   */
  private async updateProductRating(productId: number) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('COUNT(*)', 'count')
      .addSelect('AVG(r.rating)', 'avg')
      .where('r.product_id = :productId', { productId })
      .andWhere('r.status = :status', { status: 1 })
      .getRawOne();

    await this.reviewRepo.query(
      'UPDATE product SET review_count = ?, avg_rating = ? WHERE id = ?',
      [parseInt(result.count) || 0, parseFloat(result.avg) || 0, productId],
    );
  }
}
