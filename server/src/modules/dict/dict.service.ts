import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dict, DictItem } from './dict.entity';
import { CreateDictDto, UpdateDictDto, CreateDictItemDto, UpdateDictItemDto } from './dict.dto';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(Dict)
    private readonly dictRepository: Repository<Dict>,
    @InjectRepository(DictItem)
    private readonly dictItemRepository: Repository<DictItem>,
  ) {}

  // ==================== 字典管理 ====================

  /**
   * 获取字典列表
   */
  async getDictList() {
    return this.dictRepository.find({
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 获取所有字典（带项）
   */
  async getAllDictsWithItems() {
    const dicts = await this.dictRepository.find({
      order: { sort_order: 'ASC', id: 'ASC' },
    });
    
    const items = await this.dictItemRepository.find({
      order: { sort_order: 'ASC', id: 'ASC' },
    });

    return dicts.map(dict => ({
      ...dict,
      items: items.filter(item => item.dict_id === dict.id),
    }));
  }

  /**
   * 创建字典
   */
  async createDict(dto: CreateDictDto) {
    const dict = this.dictRepository.create({
      dict_name: dto.dict_name,
      dict_code: dto.dict_code,
      description: dto.description,
      sort_order: dto.sort_order || 0,
      status: 1,
    });
    return this.dictRepository.save(dict);
  }

  /**
   * 更新字典
   */
  async updateDict(id: number, dto: UpdateDictDto) {
    const dict = await this.dictRepository.findOne({ where: { id } });
    if (!dict) {
      throw new NotFoundException('字典不存在');
    }
    if (dto.dict_name !== undefined) dict.dict_name = dto.dict_name;
    if (dto.dict_code !== undefined) dict.dict_code = dto.dict_code;
    if (dto.description !== undefined) dict.description = dto.description;
    if (dto.sort_order !== undefined) dict.sort_order = dto.sort_order;
    if (dto.status !== undefined) dict.status = dto.status;
    return this.dictRepository.save(dict);
  }

  /**
   * 删除字典
   */
  async deleteDict(id: number) {
    const dict = await this.dictRepository.findOne({ where: { id } });
    if (!dict) {
      throw new NotFoundException('字典不存在');
    }
    // 删除字典项
    await this.dictItemRepository.delete({ dict_id: id });
    await this.dictRepository.delete(id);
    return { success: true };
  }

  // ==================== 字典项管理 ====================

  /**
   * 获取字典项列表
   */
  async getDictItems(dictId?: number) {
    const where = dictId ? { dict_id: dictId } : {};
    return this.dictItemRepository.find({
      where,
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 创建字典项
   */
  async createDictItem(dto: CreateDictItemDto) {
    const dict = await this.dictRepository.findOne({ where: { id: dto.dict_id } });
    if (!dict) {
      throw new NotFoundException('字典不存在');
    }
    const item = this.dictItemRepository.create({
      dict_id: dto.dict_id,
      item_label: dto.item_label,
      item_value: dto.item_value,
      sort_order: dto.sort_order || 0,
      status: 1,
    });
    return this.dictItemRepository.save(item);
  }

  /**
   * 更新字典项
   */
  async updateDictItem(id: number, dto: UpdateDictItemDto) {
    const item = await this.dictItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('字典项不存在');
    }
    if (dto.item_label !== undefined) item.item_label = dto.item_label;
    if (dto.item_value !== undefined) item.item_value = dto.item_value;
    if (dto.sort_order !== undefined) item.sort_order = dto.sort_order;
    if (dto.status !== undefined) item.status = dto.status;
    return this.dictItemRepository.save(item);
  }

  /**
   * 删除字典项
   */
  async deleteDictItem(id: number) {
    const item = await this.dictItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('字典项不存在');
    }
    await this.dictItemRepository.delete(id);
    return { success: true };
  }
}
