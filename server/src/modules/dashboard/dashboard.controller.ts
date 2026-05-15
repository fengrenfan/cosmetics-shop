import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * 获取统计数据
   * GET /api/dashboard/stats
   */
  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  /**
   * 获取销售趋势
   * GET /api/dashboard/sales-trend?days=7
   */
  @Get('sales-trend')
  async getSalesTrend(@Query('days') days?: string) {
    return this.dashboardService.getSalesTrend(parseInt(days) || 7);
  }

  /**
   * 获取商品销售排行
   * GET /api/dashboard/product-ranking?limit=5
   */
  @Get('product-ranking')
  async getProductRanking(@Query('limit') limit?: string) {
    return this.dashboardService.getProductRanking(parseInt(limit) || 5);
  }

  /**
   * 获取最新订单
   * GET /api/dashboard/latest-orders?limit=5
   */
  @Get('latest-orders')
  async getLatestOrders(@Query('limit') limit?: string) {
    return this.dashboardService.getLatestOrders(parseInt(limit) || 5);
  }

}