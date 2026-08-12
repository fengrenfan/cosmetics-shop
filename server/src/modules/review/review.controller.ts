import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto, ReviewQueryDto, AdminReplyDto, AdminReviewQueryDto } from './review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * 提交评价
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateReviewDto) {
    return this.reviewService.create(req.user.id, dto);
  }

  /**
   * 商品评价列表 (公开)
   */
  @Get('product/:id')
  async getByProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('rating') rating?: number,
  ) {
    return this.reviewService.getByProduct(id, page || 1, limit || 10, rating);
  }

  /**
   * 商品评价统计 (公开)
   */
  @Get('product/:id/stats')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.getStats(id);
  }

  /**
   * 查询可评价商品
   */
  @UseGuards(JwtAuthGuard)
  @Get('check/:orderId')
  async getReviewable(
    @Request() req,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.reviewService.getReviewable(req.user.id, orderId);
  }

  /**
   * 我的评价
   */
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async getMine(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewService.getMine(req.user.id, page || 1, limit || 10);
  }

  /**
   * 管理后台 — 评价列表
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  async adminList(@Query() query: AdminReviewQueryDto) {
    return this.reviewService.adminList(query);
  }

  /**
   * 管理后台 — 审核通过
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/:id/approve')
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.approve(id);
  }

  /**
   * 管理后台 — 审核拒绝
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/:id/reject')
  async reject(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.reject(id);
  }

  /**
   * 管理后台 — 回复评价
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/:id/reply')
  async reply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminReplyDto,
  ) {
    return this.reviewService.reply(id, dto.admin_reply);
  }
}
