import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DictService } from './dict.service';

@Controller('dict')
@UseGuards(JwtAuthGuard)
export class DictController {
  constructor(private readonly dictService: DictService) {}

  // ==================== 字典接口 ====================

  /**
   * 获取所有字典（带项）
   * GET /api/dict
   */
  @Get()
  async getAllDictsWithItems() {
    return this.dictService.getAllDictsWithItems();
  }

  /**
   * 获取字典列表
   * GET /api/dict/list
   */
  @Get('list')
  async getDictList() {
    return this.dictService.getDictList();
  }

  /**
   * 创建字典
   * POST /api/dict
   */
  @Post()
  async createDict(@Body() dto: { dict_name: string; dict_code: string; description?: string; sort_order?: number }) {
    return this.dictService.createDict(dto);
  }

  /**
   * 更新字典
   * PUT /api/dict/:id
   */
  @Put(':id')
  async updateDict(@Param('id') id: number, @Body() dto: { dict_name?: string; dict_code?: string; description?: string; sort_order?: number; status?: number }) {
    return this.dictService.updateDict(id, dto);
  }

  /**
   * 删除字典
   * DELETE /api/dict/:id
   */
  @Delete(':id')
  async deleteDict(@Param('id') id: number) {
    return this.dictService.deleteDict(id);
  }

  // ==================== 字典项接口 ====================

  /**
   * 获取字典项列表
   * GET /api/dict/item?dictId=1
   */
  @Get('item')
  async getDictItems(@Query('dictId') dictId?: string) {
    return this.dictService.getDictItems(dictId ? parseInt(dictId) : undefined);
  }

  /**
   * 创建字典项
   * POST /api/dict/item
   */
  @Post('item')
  async createDictItem(@Body() dto: { dict_id: number; item_label: string; item_value: string; sort_order?: number }) {
    return this.dictService.createDictItem(dto);
  }

  /**
   * 更新字典项
   * PUT /api/dict/item/:id
   */
  @Put('item/:id')
  async updateDictItem(@Param('id') id: number, @Body() dto: { item_label?: string; item_value?: string; sort_order?: number; status?: number }) {
    return this.dictService.updateDictItem(id, dto);
  }

  /**
   * 删除字典项
   * DELETE /api/dict/item/:id
   */
  @Delete('item/:id')
  async deleteDictItem(@Param('id') id: number) {
    return this.dictService.deleteDictItem(id);
  }
}
