import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrowseHistory } from './browse-history.entity';

@Injectable()
export class BrowseHistoryService {
  constructor(
    @InjectRepository(BrowseHistory)
    private readonly browseHistoryRepository: Repository<BrowseHistory>,
  ) {}

  async addOrUpdate(userId: number, productId: number) {
    const existing = await this.browseHistoryRepository.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      existing.viewed_at = new Date();
      await this.browseHistoryRepository.save(existing);
    } else {
      const record = this.browseHistoryRepository.create({
        user_id: userId,
        product_id: productId,
        viewed_at: new Date(),
      });
      await this.browseHistoryRepository.save(record);
    }
  }

  async getList(userId: number, page: number = 1, pageSize: number = 20) {
    const qb = this.browseHistoryRepository
      .createQueryBuilder('bh')
      .leftJoinAndSelect('bh.product', 'product')
      .where('bh.user_id = :userId', { userId })
      .orderBy('bh.viewed_at', 'DESC');

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async clear(userId: number) {
    await this.browseHistoryRepository.delete({ user_id: userId });
  }

  async delete(userId: number, productId: number) {
    await this.browseHistoryRepository.delete({
      user_id: userId,
      product_id: productId,
    });
  }
}
