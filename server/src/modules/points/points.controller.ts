import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PointsService } from './points.service';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  // 获取积分余额
  @Get()
  async getPoints(@Req() req: any) {
    return this.pointsService.getPoints(req.user.id);
  }

  // 获取积分明细
  @Get('logs')
  async getLogs(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.pointsService.getLogs(req.user.id, +page, +pageSize);
  }

  // 计算抵扣
  @Post('calculate')
  async calculate(@Req() req: any, @Body() body: { total_amount: number; points?: number }) {
    return this.pointsService.calculateDeduction(req.user.id, body.total_amount, body.points);
  }
}