import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuickEntryService } from './quick-entry.service';

@Controller('quick-entry')
export class QuickEntryController {
  constructor(private readonly quickEntryService: QuickEntryService) {}

  /**
   * 获取活跃的快捷入口列表 (小程序用)
   * GET /api/quick-entry/list
   */
  @Get('list')
  async getList() {
    return this.quickEntryService.getActiveList();
  }

  /**
   * 获取所有快捷入口 (管理员)
   * GET /api/quick-entry/admin
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdminList() {
    return this.quickEntryService.getAllList();
  }

  /**
   * 创建快捷入口
   * POST /api/quick-entry
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: { title: string; icon?: string; type?: string; target_id?: string; sort_order?: number }) {
    return this.quickEntryService.create(dto);
  }

  /**
   * 更新快捷入口
   * PUT /api/quick-entry/:id
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: { title?: string; icon?: string; type?: string; target_id?: string; sort_order?: number; status?: number }) {
    return this.quickEntryService.update(id, dto);
  }

  /**
   * 删除快捷入口
   * DELETE /api/quick-entry/:id
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.quickEntryService.delete(id);
  }
}
