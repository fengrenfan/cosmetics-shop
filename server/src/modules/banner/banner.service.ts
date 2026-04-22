import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './banner.entity';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  /**
   * 获取活跃的 Banner 列表
   */
  async getActiveList() {
    return this.bannerRepository.find({
      where: { status: 1 },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  /**
   * 获取所有 Banner (管理员)
   */
  async getAllList() {
    return this.bannerRepository.find({
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  /**
   * 创建 Banner
   */
  async create(dto: { title: string; image: string; link_type?: string; link_id?: string; sort_order?: number }) {
    const banner = this.bannerRepository.create({
      title: dto.title,
      image: dto.image,
      link_type: dto.link_type || 'none',
      link_id: dto.link_id,
      sort_order: dto.sort_order || 0,
      status: 1,
    });
    return this.bannerRepository.save(banner);
  }

  /**
   * 更新 Banner
   */
  async update(id: number, dto: { title?: string; image?: string; link_type?: string; link_id?: string; sort_order?: number; status?: number }) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException('Banner不存在');
    }
    if (dto.title !== undefined) banner.title = dto.title;
    if (dto.image !== undefined) banner.image = dto.image;
    if (dto.link_type !== undefined) banner.link_type = dto.link_type;
    if (dto.link_id !== undefined) banner.link_id = dto.link_id;
    if (dto.sort_order !== undefined) banner.sort_order = dto.sort_order;
    if (dto.status !== undefined) banner.status = dto.status;
    return this.bannerRepository.save(banner);
  }

  /**
   * 删除 Banner
   */
  async delete(id: number) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException('Banner不存在');
    }
    await this.bannerRepository.delete(id);
    return { success: true };
  }
}
