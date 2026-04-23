import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  /**
   * 获取收藏列表
   */
  async getList(userId: number) {
    const favorites = await this.favoriteRepository.find({
      where: { user_id: userId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });

    return favorites
      .filter((f) => f.product)
      .map((f) => ({
        id: f.id,
        product_id: f.product_id,
        title: f.product.title,
        cover_image: f.product.cover_image,
        price: f.product.price,
        created_at: f.created_at,
      }));
  }

  /**
   * 获取收藏数量
   */
  async getCount(userId: number) {
    return this.favoriteRepository.count({ where: { user_id: userId } });
  }

  /**
   * 收藏/取消收藏
   */
  async toggle(userId: number, productId: number) {
    const exist = await this.favoriteRepository.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (exist) {
      await this.favoriteRepository.delete(exist.id);
      return { is_favorited: false };
    }

    const favorite = this.favoriteRepository.create({
      user_id: userId,
      product_id: productId,
    });

    await this.favoriteRepository.save(favorite);
    return { is_favorited: true };
  }
}
