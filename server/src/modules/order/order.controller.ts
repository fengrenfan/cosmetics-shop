import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
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

  /**
   * 本地开发：模拟下单（跳过校验）
   * POST /api/order/mock/create
   */
  @UseGuards(JwtAuthGuard)
  @Post('mock/create')
  async mockCreate(@Request() req) {
    return this.orderService.mockCreate(req.user?.id);
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
   * 导出订单 CSV
   * GET /api/order/admin/export
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/export')
  async exportOrders(@Query() query: Record<string, string>, @Res() res: Response) {
    const list = await this.orderService.exportOrders(query);

    const statusMap: Record<string, string> = {
      pending: '待付款', paid: '已付款', shipped: '已发货',
      completed: '已完成', cancelled: '已取消', refunded: '已退款',
    };
    const payStatusMap: Record<string, string> = {
      unpaid: '未支付', paying: '支付中', paid: '已支付',
      failed: '支付失败', closed: '已关闭', refunding: '退款中', refunded: '已退款',
    };
    const channelMap: Record<string, string> = { wechat: '微信', alipay: '支付宝' };

    const header = '订单号,用户ID,商品名称,商品金额,运费,优惠券抵扣,实付金额,订单状态,支付状态,支付渠道,下单时间\n';
    const rows = list.map(o => {
      const goodsNames = (o.items || []).map(i => i.product_title).join(';').replace(/,/g, '，');
      const goodsAmount = o.total_amount;
      const createdAt = o.created_at instanceof Date
        ? `${o.created_at.getFullYear()}-${String(o.created_at.getMonth() + 1).padStart(2, '0')}-${String(o.created_at.getDate()).padStart(2, '0')} ${String(o.created_at.getHours()).padStart(2, '0')}:${String(o.created_at.getMinutes()).padStart(2, '0')}`
        : o.created_at;
      return [
        o.order_no, o.user_id, goodsNames, goodsAmount,
        o.freight_amount, o.coupon_amount || 0, o.pay_amount,
        statusMap[o.status] || o.status,
        payStatusMap[o.pay_status] || o.pay_status,
        channelMap[o.pay_channel] || '-',
        createdAt,
      ].join(',');
    }).join('\n');

    const bom = '﻿';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=orders_${date}.csv`,
    });
    res.send(bom + header + rows);
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
