import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

// 化妆品标准类目
const cosmeticsCategories = [
  { name: '护肤', sort_order: 1, children: [
    { name: '面膜', sort_order: 1 },
    { name: '乳液/面霜', sort_order: 2 },
    { name: '精华', sort_order: 3 },
    { name: '洁面', sort_order: 4 },
    { name: '防晒', sort_order: 5 },
    { name: '爽肤水', sort_order: 6 },
    { name: '眼霜', sort_order: 7 },
  ]},
  { name: '彩妆', sort_order: 2, children: [
    { name: '口红', sort_order: 1 },
    { name: '唇釉', sort_order: 2 },
    { name: '眼影', sort_order: 3 },
    { name: '粉底', sort_order: 4 },
    { name: '遮瑕', sort_order: 5 },
    { name: '睫毛膏', sort_order: 6 },
    { name: '眉笔/眉粉', sort_order: 7 },
    { name: '腮红', sort_order: 8 },
    { name: '高光/修容', sort_order: 9 },
    { name: '定妆', sort_order: 10 },
  ]},
  { name: '香水', sort_order: 3, children: [
    { name: '女士香水', sort_order: 1 },
    { name: '男士香水', sort_order: 2 },
    { name: '中性香水', sort_order: 3 },
  ]},
  { name: '美发', sort_order: 4, children: [
    { name: '洗发水', sort_order: 1 },
    { name: '护发素', sort_order: 2 },
    { name: '发膜', sort_order: 3 },
    { name: '造型工具', sort_order: 4 },
  ]},
  { name: '美甲', sort_order: 5, children: [
    { name: '指甲油', sort_order: 1 },
    { name: '美甲工具', sort_order: 2 },
    { name: '卸甲', sort_order: 3 },
  ]},
  { name: '工具/配件', sort_order: 6, children: [
    { name: '化妆刷', sort_order: 1 },
    { name: '美妆蛋', sort_order: 2 },
    { name: '睫毛夹', sort_order: 3 },
    { name: '面膜刷', sort_order: 4 },
    { name: '化妆包', sort_order: 5 },
  ]},
];

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    // 检查是否已有数据
    const count = await this.categoryRepository.count();
    if (count === 0) {
      console.log('📦 初始化化妆品类目数据...');
      for (const cat of cosmeticsCategories) {
        const parent = await this.categoryRepository.save({
          name: cat.name,
          parent_id: 0,
          level: 1,
          sort_order: cat.sort_order,
          icon: '',
          status: 1,
        });
        if (cat.children?.length) {
          for (const child of cat.children) {
            await this.categoryRepository.save({
              name: child.name,
              parent_id: parent.id,
              level: 2,
              sort_order: child.sort_order,
              icon: '',
              status: 1,
            });
          }
        }
      }
      console.log('✅ 化妆品类目数据初始化完成');
    }
  }

  /**
   * 获取分类树
   */
  async getTree() {
    const allCategories = await this.categoryRepository.find({
      where: { status: 1 },
      order: { sort_order: 'ASC', id: 'ASC' },
    });

    return this.buildTree(allCategories, 0);
  }

  /**
   * 获取所有分类列表
   */
  async getList() {
    return this.categoryRepository.find({
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 创建分类
   */
  async create(dto: { name: string; parent_id?: number; sort_order?: number; icon?: string }) {
    const parentId = dto.parent_id || 0;
    // 计算层级
    let level = 1;
    if (parentId > 0) {
      const parent = await this.categoryRepository.findOne({ where: { id: parentId } });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const category = this.categoryRepository.create({
      name: dto.name,
      parent_id: parentId,
      level,
      sort_order: dto.sort_order || 0,
      icon: dto.icon,
      status: 1,
    });
    return this.categoryRepository.save(category);
  }

  /**
   * 更新分类
   */
  async update(id: number, dto: { name?: string; parent_id?: number; sort_order?: number; icon?: string; status?: number }) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.parent_id !== undefined) category.parent_id = dto.parent_id;
    if (dto.sort_order !== undefined) category.sort_order = dto.sort_order;
    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.status !== undefined) category.status = dto.status;
    // 如果修改了parent_id，重新计算层级
    if (dto.parent_id !== undefined) {
      const parentId = dto.parent_id;
      let level = 1;
      if (parentId > 0) {
        const parent = await this.categoryRepository.findOne({ where: { id: parentId } });
        if (parent) {
          level = parent.level + 1;
        }
      }
      category.level = level;
    }
    return this.categoryRepository.save(category);
  }

  /**
   * 删除分类
   */
  async delete(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    // 检查是否有子分类
    const children = await this.categoryRepository.find({ where: { parent_id: id } });
    if (children.length > 0) {
      throw new NotFoundException('请先删除子分类');
    }
    await this.categoryRepository.delete(id);
    return { success: true };
  }

  /**
   * 构建树形结构
   */
  private buildTree(categories: Category[], parentId: number, level = 1): any[] {
    return categories
      .filter((c) => c.parent_id === parentId)
      .map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        level,
        status: c.status,
        parent_id: c.parent_id,
        sort_order: c.sort_order,
        hasChildren: categories.some(child => child.parent_id === c.id),
        children: this.buildTree(categories, c.id, level + 1),
      }));
  }
}
