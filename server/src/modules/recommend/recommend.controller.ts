import { Controller, Get, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recommend')
export class RecommendController {
  constructor(private readonly recommendService: RecommendService) {}

  /**
   * 个性化推荐 (需要登录)
   * GET /api/recommend/personalized
   */
  @UseGuards(JwtAuthGuard)
  @Get('personalized')
  async getPersonalized(@Request() req, @Query('limit') limit?: number) {
    return this.recommendService.getPersonalized(req.user.id, limit || 10);
  }

  /**
   * 相似商品推荐
   * GET /api/recommend/similar/:productId
   */
  @Get('similar/:productId')
  async getSimilar(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('limit') limit?: number,
  ) {
    return this.recommendService.getSimilar(productId, limit || 10);
  }

  /**
   * 热门推荐
   * GET /api/recommend/hot
   */
  @Get('hot')
  async getHot(@Query('limit') limit?: number) {
    return this.recommendService.getHot(limit || 10);
  }

  /**
   * 猜你喜欢 (商品详情页底部)
   * GET /api/recommend/guess
   */
  @Get('guess')
  async getGuessYouLike(@Request() req, @Query('limit') limit?: number) {
    const userId = req.user?.id || null;
    return this.recommendService.getGuessYouLike(userId, limit || 6);
  }
}
