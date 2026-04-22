import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductListDto, CreateProductDto, UpdateProductDto } from './product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * 商品列表
   * GET /api/product/list
   */
  @Get('list')
  async getList(@Query() query: ProductListDto) {
    return this.productService.getList(query);
  }

  /**
   * 推荐商品
   * GET /api/product/recommend
   */
  @Get('recommend')
  async getRecommend(@Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.productService.getRecommend({ page: +page, pageSize: +pageSize });
  }

  /**
   * 主推商品
   * GET /api/product/featured
   */
  @Get('featured')
  async getFeatured() {
    return this.productService.getFeatured();
  }

  /**
   * 热卖商品
   * GET /api/product/hot
   */
  @Get('hot')
  async getHot(@Query('limit') limit = 10) {
    return this.productService.getHot(+limit);
  }

  /**
   * 商品详情
   * GET /api/product/:id
   */
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.productService.getDetail(+id);
  }

  // ==================== 管理端接口 ====================

  /**
   * 创建商品 (Admin)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  /**
   * 批量更新状态 (Admin)
   */
  @UseGuards(JwtAuthGuard)
  @Put('batch-status')
  async batchUpdateStatus(@Body() dto: { ids: number[]; status: number }) {
    return this.productService.batchUpdateStatus(dto.ids, dto.status);
  }

  /**
   * 更新商品 (Admin)
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(+id, dto);
  }

  /**
   * 删除商品 (Admin)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productService.delete(+id);
  }

  /**
   * 上下架 (Admin)
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: number) {
    return this.productService.updateStatus(+id, status);
  }
}
