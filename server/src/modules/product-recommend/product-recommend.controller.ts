import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductRecommendService } from './product-recommend.service';

@Controller('product-recommend')
export class ProductRecommendController {
  constructor(private readonly productRecommendService: ProductRecommendService) {}

  /**
   * 获取推荐的商品ID列表 (小程序用)
   * GET /api/product-recommend/ids
   */
  @Get('ids')
  async getRecommendIds(@Query('type') type: string = 'home') {
    const recommends = await this.productRecommendService.getRecommendProducts(type);
    return recommends.map(r => r.product_id);
  }

  /**
   * 获取所有推荐配置 (管理员)
   * GET /api/product-recommend/admin
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdminList() {
    return this.productRecommendService.getAllList();
  }

  /**
   * 获取热销推荐配置 (管理员)
   * GET /api/product-recommend/hot-admin
   */
  @UseGuards(JwtAuthGuard)
  @Get('hot-admin')
  async getHotAdminList() {
    return this.productRecommendService.getListByType('hot');
  }

  /**
   * 获取推荐商品列表 (小程序用，公开)
   * GET /api/product-recommend
   */
  @Get()
  async getRecommendProducts() {
    return this.productRecommendService.getRecommendProductsWithDetail('home');
  }

  /**
   * 获取热销商品列表 (小程序用，公开)
   * GET /api/product-recommend/hot
   */
  @Get('hot')
  async getHotProducts() {
    return this.productRecommendService.getHotProductsWithDetail();
  }

  /**
   * 添加商品到推荐
   * POST /api/product-recommend
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: { product_id: number; recommend_type?: string; sort_order?: number }) {
    return this.productRecommendService.create(dto);
  }

  /**
   * 更新推荐
   * PUT /api/product-recommend/:id
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: { sort_order?: number; status?: number }) {
    return this.productRecommendService.update(id, dto);
  }

  /**
   * 删除推荐
   * DELETE /api/product-recommend/:id
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.productRecommendService.delete(id);
  }
}
