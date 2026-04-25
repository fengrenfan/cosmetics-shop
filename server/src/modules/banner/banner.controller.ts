import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BannerService } from './banner.service';

@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  /**
   * Banner列表 (小程序用)
   * GET /api/banner/list
   */
  @Get('list')
  async getList() {
    return this.bannerService.getActiveList();
  }

  /**
   * 获取所有Banner (管理员)
   * GET /api/banner
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdminList() {
    return this.bannerService.getAllList();
  }

  /**
   * 创建Banner
   * POST /api/banner
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: { title: string; subtitle?: string; tag?: string; image: string; link_type?: string; link_id?: string; sort_order?: number }) {
    return this.bannerService.create(dto);
  }

  /**
   * 更新Banner
   * PUT /api/banner/:id
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: { title?: string; subtitle?: string; tag?: string; image?: string; link_type?: string; link_id?: string; sort_order?: number; status?: number }) {
    return this.bannerService.update(id, dto);
  }

  /**
   * 删除Banner
   * DELETE /api/banner/:id
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.bannerService.delete(id);
  }
}
