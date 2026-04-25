import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 创建订单
   * POST /api/order/create
   */
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Request() req, @Body() dto: CreateOrderDto) {
    dto.user_id = dto.user_id || req.user?.id;
    return this.orderService.create(dto);
  }

  /**
   * 订单列表
   * GET /api/order/list
   */
  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getList(@Request() req, @Query() query: any) {
    query.user_id = query.user_id || req.user?.id;
    return this.orderService.getList(query);
  }

  /**
   * 获取订单数量统计
   * GET /api/order/count
   */
  @UseGuards(JwtAuthGuard)
  @Get('count')
  async getCount(@Request() req) {
    if (!req.user?.id) {
      return { pending: 0, paid: 0, shipped: 0, completed: 0 };
    }
    return this.orderService.getCount(req.user.id);
  }

  /**
   * 订单详情
   * GET /api/order/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.orderService.getDetail(+id);
  }

  /**
   * 取消订单
   * PUT /api/order/:id/cancel
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  async cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.orderService.cancel(+id, reason);
  }

  /**
   * 确认收货
   * PUT /api/order/:id/confirm
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.orderService.confirm(+id);
  }

  // ==================== 管理端接口 ====================

  /**
   * 管理端订单列表
   * GET /api/order/admin/list
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  async getAdminList(@Query() query: any) {
    return this.orderService.getAdminList(query);
  }

  /**
   * 管理端订单发货
   * PUT /api/order/admin/:id/ship
   */
  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/ship')
  async ship(@Param('id') id: string, @Body() dto: { express_company: string; express_no: string }) {
    return this.orderService.ship(+id, dto);
  }

  /**
   * 管理端退款
   * PUT /api/order/admin/:id/refund
   */
  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/refund')
  async refund(@Param('id') id: string) {
    return this.orderService.refund(+id);
  }
}
