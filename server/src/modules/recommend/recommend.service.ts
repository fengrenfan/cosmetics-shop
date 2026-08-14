import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../product/product.entity';
import { ProductSku } from '../product/product-sku.entity';
import { BrowseHistory } from '../browse-history/browse-history.entity';
import { Favorite } from '../favorite/favorite.entity';
import { OrderItem } from '../order/order-item.entity';
import { Cart } from '../cart/cart.entity';

@Injectable()
export class RecommendService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductSku)
    private readonly skuRepo: Repository<ProductSku>,
    @InjectRepository(BrowseHistory)
    private readonly browseRepo: Repository<BrowseHistory>,
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
  ) {}

  /**
   * 个性化推荐 — 基于用户行为
   * 算法: 收集用户浏览/收藏/购买的商品 → 提取分类偏好 → 推荐同分类热门商品
   */
  async getPersonalized(userId: number, limit = 10) {
    // 1. 收集用户行为数据
    const [browseIds, favoriteIds, boughtIds] = await Promise.all([
      this.getUserBrowseProductIds(userId, 50),
      this.getUserFavoriteProductIds(userId),
      this.getUserBoughtProductIds(userId),
    ]);

    // 2. 计算分类偏好 (浏览权重1, 收藏权重3, 购买权重5)
    const categoryScores = new Map<number, number>();
    const interactedIds = new Set<number>();

    const browseProducts = await this.productRepo.find({
      where: { id: In(browseIds) },
      select: ['id', 'category_id'],
    });
    for (const p of browseProducts) {
      categoryScores.set(p.category_id, (categoryScores.get(p.category_id) || 0) + 1);
      interactedIds.add(p.id);
    }

    const favoriteProducts = await this.productRepo.find({
      where: { id: In(favoriteIds) },
      select: ['id', 'category_id'],
    });
    for (const p of favoriteProducts) {
      categoryScores.set(p.category_id, (categoryScores.get(p.category_id) || 0) + 3);
      interactedIds.add(p.id);
    }

    const boughtProducts = await this.productRepo.find({
      where: { id: In(boughtIds) },
      select: ['id', 'category_id'],
    });
    for (const p of boughtProducts) {
      categoryScores.set(p.category_id, (categoryScores.get(p.category_id) || 0) + 5);
      interactedIds.add(p.id);
    }

    // 3. 按分数排序分类
    const sortedCategories = [...categoryScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    if (sortedCategories.length === 0) {
      // 无行为数据，降级为热门推荐
      return this.getHot(limit);
    }

    // 4. 从偏好分类中推荐用户未交互过的商品
    const excludeIds = [...interactedIds];
    const candidates = await this.productRepo
      .createQueryBuilder('p')
      .where('p.status = :status', { status: 1 })
      .andWhere('p.stock > 0')
      .andWhere(excludeIds.length > 0 ? 'p.id NOT IN (:...excludeIds)' : '1=1', { excludeIds })
      .orderBy(`FIELD(p.category_id, ${sortedCategories.join(',')})`, 'ASC')
      .addOrderBy('p.sales_count', 'DESC')
      .addOrderBy('p.avg_rating', 'DESC')
      .limit(limit)
      .getMany();

    // 如果候选不够，补充热门商品
    if (candidates.length < limit) {
      const candidateIds = new Set(candidates.map(c => c.id));
      const hotProducts = await this.getHot(limit * 2);
      for (const p of hotProducts) {
        if (candidates.length >= limit) break;
        if (!candidateIds.has(p.id) && !interactedIds.has(p.id)) {
          candidates.push(p);
          candidateIds.add(p.id);
        }
      }
    }

    return this.enrichProducts(candidates);
  }

  /**
   * 相似商品推荐 — 基于分类 + 价格区间
   */
  async getSimilar(productId: number, limit = 10) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) return this.getHot(limit);

    // 同分类、价格±30%的商品
    const priceMin = Number(product.price) * 0.7;
    const priceMax = Number(product.price) * 1.3;

    const similar = await this.productRepo
      .createQueryBuilder('p')
      .where('p.status = :status', { status: 1 })
      .andWhere('p.stock > 0')
      .andWhere('p.id != :currentId', { currentId: productId })
      .andWhere('p.category_id = :categoryId', { categoryId: product.category_id })
      .andWhere('p.price BETWEEN :priceMin AND :priceMax', { priceMin, priceMax })
      .orderBy('p.sales_count', 'DESC')
      .limit(limit)
      .getMany();

    // 如果不够，放宽到同分类
    if (similar.length < limit) {
      const existingIds = new Set(similar.map(s => s.id));
      existingIds.add(productId);

      const moreProducts = await this.productRepo
        .createQueryBuilder('p')
        .where('p.status = :status', { status: 1 })
        .andWhere('p.stock > 0')
        .andWhere('p.id NOT IN (:...ids)', { ids: [...existingIds] })
        .andWhere('p.category_id = :categoryId', { categoryId: product.category_id })
        .orderBy('p.sales_count', 'DESC')
        .limit(limit - similar.length)
        .getMany();

      similar.push(...moreProducts);
    }

    // 如果还不够，补充热门
    if (similar.length < limit) {
      const existingIds = new Set(similar.map(s => s.id));
      existingIds.add(productId);
      const hotProducts = await this.getHot(limit * 2);
      for (const p of hotProducts) {
        if (similar.length >= limit) break;
        if (!existingIds.has(p.id)) {
          similar.push(p);
          existingIds.add(p.id);
        }
      }
    }

    return this.enrichProducts(similar);
  }

  /**
   * 热门推荐 — 销量 + 评分加权
   */
  async getHot(limit = 10) {
    const products = await this.productRepo
      .createQueryBuilder('p')
      .where('p.status = :status', { status: 1 })
      .andWhere('p.stock > 0')
      .orderBy('(p.sales_count * 0.7 + p.review_count * 0.3)', 'DESC')
      .addOrderBy('p.avg_rating', 'DESC')
      .limit(limit)
      .getMany();

    return this.enrichProducts(products);
  }

  /**
   * 猜你喜欢 — 浏览某商品后的推荐 (商品详情页底部)
   */
  async getGuessYouLike(userId: number | null, limit = 6) {
    if (userId) {
      return this.getPersonalized(userId, limit);
    }
    return this.getHot(limit);
  }

  // ==================== 辅助方法 ====================

  private async getUserBrowseProductIds(userId: number, limit: number): Promise<number[]> {
    const records = await this.browseRepo.find({
      where: { user_id: userId },
      order: { viewed_at: 'DESC' },
      take: limit,
      select: ['product_id'],
    });
    return records.map(r => r.product_id);
  }

  private async getUserFavoriteProductIds(userId: number): Promise<number[]> {
    const records = await this.favoriteRepo.find({
      where: { user_id: userId },
      select: ['product_id'],
    });
    return records.map(r => r.product_id);
  }

  private async getUserBoughtProductIds(userId: number): Promise<number[]> {
    const records = await this.orderItemRepo
      .createQueryBuilder('oi')
      .select('DISTINCT oi.product_id', 'product_id')
      .leftJoin('order', 'o', 'o.id = oi.order_id')
      .where('o.user_id = :userId', { userId })
      .andWhere('o.status IN (:...statuses)', { statuses: ['paid', 'shipped', 'completed'] })
      .getRawMany();
    return records.map(r => r.product_id);
  }

  private async enrichProducts(products: Product[]) {
    if (products.length === 0) return [];

    // 加载 SKU 信息
    const ids = products.map(p => p.id);
    const skus = await this.skuRepo.find({
      where: { product_id: In(ids), status: 1 },
    });

    const skusByProduct = new Map<number, any[]>();
    for (const sku of skus) {
      const list = skusByProduct.get(sku.product_id) || [];
      list.push(sku);
      skusByProduct.set(sku.product_id, list);
    }

    return products.map(p => ({
      ...p,
      skus: skusByProduct.get(p.id) || [],
      tag: p.is_new ? '新品' : p.is_hot ? '热卖' : p.is_recommend ? '推荐' : null,
    }));
  }
}
