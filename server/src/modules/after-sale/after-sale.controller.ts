import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AfterSaleService } from './after-sale.service';
import { CreateAfterSaleDto, AdminAfterSaleQueryDto, AdminProcessDto } from './after-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('after-sales')
export class AfterSaleController {
  constructor(private readonly afterSaleService: AfterSaleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateAfterSaleDto) {
    return this.afterSaleService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async getMine(@Request() req, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.afterSaleService.getMine(req.user.id, page || 1, limit || 10);
  }

  @UseGuards(JwtAuthGuard)
  @Get('refundable')
  async getRefundableOrders(@Request() req) {
    return this.afterSaleService.getRefundableOrders(req.user.id);
  }

  // 注意：动态路由 ':id' 必须放在静态路由 ('admin' 等) 之后声明，
  // 否则 /api/after-sales/admin 会被 ':id' 捕获，导致 ParseIntPipe 抛出
  // "Validation failed (numeric string is expected)"
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  async adminList(@Query() query: Record<string, any>) {
    return this.afterSaleService.adminList(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getDetail(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.afterSaleService.getDetail(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/:id/approve')
  async approve(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminProcessDto) {
    return this.afterSaleService.approve(id, dto.admin_remark);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/:id/reject')
  async reject(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminProcessDto) {
    return this.afterSaleService.reject(id, dto.admin_remark);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('admin/:id/refund')
  async confirmRefund(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminProcessDto) {
    return this.afterSaleService.confirmRefund(id, dto.admin_remark);
  }
}
