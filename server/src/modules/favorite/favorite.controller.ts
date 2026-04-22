import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoriteService } from './favorite.service';

@Controller('favorite')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * 我的收藏列表
   * GET /api/favorite/list
   */
  @Get('list')
  async getList(@Body('user_id') userId: number) {
    return this.favoriteService.getList(userId);
  }

  /**
   * 收藏/取消收藏
   * POST /api/favorite/toggle
   */
  @Post('toggle')
  async toggle(@Body('user_id') userId: number, @Body('product_id') productId: number) {
    return this.favoriteService.toggle(userId, productId);
  }
}
