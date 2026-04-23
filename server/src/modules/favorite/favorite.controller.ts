import { Controller, Get, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
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
  async getList(@Request() req) {
    return this.favoriteService.getList(req.user.id);
  }

  /**
   * 收藏/取消收藏
   * POST /api/favorite/toggle
   */
  @Post('toggle')
  async toggle(@Request() req, @Body('product_id') productId: number) {
    return this.favoriteService.toggle(req.user.id, productId);
  }
}
