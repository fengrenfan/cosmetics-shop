import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRecommend } from './product-recommend.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class ProductRecommendService {
  constructor(
    @InjectRepository(ProductRecommend)
    private readonly recommendRepository: Repository<ProductRecommend>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 获取推荐的商品ID列表
   */
  async getRecommendProducts(type: string = 'home') {
    return this.recommendRepository.find({
      where: { status: 1, recommend_type: type },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  /**
   * 获取推荐商品列表（含商品详情，供小程序调用）
   */
  async getRecommendProductsWithDetail(type: string = 'home') {
    const recommends = await this.recommendRepository.find({
      where: { status: 1, recommend_type: type },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });

    if (!recommends.length) {
      return { list: [], total: 0 };
    }

    const productIds = recommends.map(r => r.product_id);
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.id IN (:...ids)', { ids: productIds })
      .andWhere('product.status = :status', { status: 1 })
      .getMany();

    const productMap = new Map(products.map(p => [p.id, p]));
    const list = productIds.map(id => productMap.get(id)).filter(Boolean);
    return { list, total: list.length };
  }

  /**
   * 获取热销商品列表（含商品详情，供小程序调用）
   */
  async getHotProductsWithDetail() {
    const result = await this.getRecommendProductsWithDetail('hot');
    return result.list;
  }

  /**
   * 获取所有推荐配置 (管理员)
   */
  async getAllList() {
    return this.recommendRepository.find({
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  /**
   * 按类型获取推荐配置
   */
  async getListByType(type: string) {
    return this.recommendRepository.find({
      where: { recommend_type: type },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  /**
   * 创建推荐
   */
  async create(dto: { product_id: number; recommend_type?: string; sort_order?: number }) {
    const recommend = this.recommendRepository.create({
      product_id: dto.product_id,
      recommend_type: dto.recommend_type || 'home',
      sort_order: dto.sort_order || 0,
      status: 1,
    });
    return this.recommendRepository.save(recommend);
  }

  /**
   * 更新推荐
   */
  async update(id: number, dto: { sort_order?: number; status?: number }) {
    const recommend = await this.recommendRepository.findOne({ where: { id } });
    if (!recommend) {
      throw new NotFoundException('推荐不存在');
    }
    if (dto.sort_order !== undefined) recommend.sort_order = dto.sort_order;
    if (dto.status !== undefined) recommend.status = dto.status;
    return this.recommendRepository.save(recommend);
  }

  /**
   * 删除推荐
   */
  async delete(id: number) {
    const recommend = await this.recommendRepository.findOne({ where: { id } });
    if (!recommend) {
      throw new NotFoundException('推荐不存在');
    }
    await this.recommendRepository.delete(id);
    return { success: true };
  }
}
