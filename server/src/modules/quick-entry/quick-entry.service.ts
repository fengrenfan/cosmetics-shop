import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuickEntry } from './quick-entry.entity';
import { CreateQuickEntryDto, UpdateQuickEntryDto } from './quick-entry.dto';

@Injectable()
export class QuickEntryService {
  constructor(
    @InjectRepository(QuickEntry)
    private readonly quickEntryRepository: Repository<QuickEntry>,
  ) {}

  /**
   * 获取活跃的快捷入口列表 (小程序用)
   */
  async getActiveList() {
    return this.quickEntryRepository.find({
      where: { status: 1 },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  /**
   * 获取所有快捷入口 (管理员)
   */
  async getAllList() {
    return this.quickEntryRepository.find({
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  /**
   * 创建快捷入口
   */
  async create(dto: CreateQuickEntryDto) {
    const quickEntry = this.quickEntryRepository.create({
      title: dto.title,
      icon: dto.icon,
      type: dto.type || 'none',
      target_id: dto.target_id,
      sort_order: dto.sort_order || 0,
      status: dto.status ?? 1,
    });
    return this.quickEntryRepository.save(quickEntry);
  }

  /**
   * 更新快捷入口
   */
  async update(id: number, dto: UpdateQuickEntryDto) {
    const quickEntry = await this.quickEntryRepository.findOne({ where: { id } });
    if (!quickEntry) {
      throw new NotFoundException('快捷入口不存在');
    }
    if (dto.title !== undefined) quickEntry.title = dto.title;
    if (dto.icon !== undefined) quickEntry.icon = dto.icon;
    if (dto.type !== undefined) quickEntry.type = dto.type;
    if (dto.target_id !== undefined) quickEntry.target_id = dto.target_id;
    if (dto.sort_order !== undefined) quickEntry.sort_order = dto.sort_order;
    if (dto.status !== undefined) quickEntry.status = dto.status;
    return this.quickEntryRepository.save(quickEntry);
  }

  /**
   * 删除快捷入口
   */
  async delete(id: number) {
    const quickEntry = await this.quickEntryRepository.findOne({ where: { id } });
    if (!quickEntry) {
      throw new NotFoundException('快捷入口不存在');
    }
    await this.quickEntryRepository.delete(id);
    return { success: true };
  }
}
