import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 获取分类树
   * GET /api/category/tree
   */
  @Get('tree')
  async getTree() {
    return this.categoryService.getTree();
  }

  /**
   * 获取分类列表 (管理员)
   * GET /api/category
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getList() {
    return this.categoryService.getList();
  }

  /**
   * 创建分类
   * POST /api/category
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: { name: string; parent_id?: number; sort_order?: number; icon?: string }) {
    return this.categoryService.create(dto);
  }

  /**
   * 更新分类
   * PUT /api/category/:id
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: { name?: string; parent_id?: number; sort_order?: number; icon?: string; status?: number }) {
    return this.categoryService.update(id, dto);
  }

  /**
   * 删除分类
   * DELETE /api/category/:id
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.categoryService.delete(id);
  }
}
