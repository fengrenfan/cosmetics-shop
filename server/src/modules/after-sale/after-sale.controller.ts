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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getDetail(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.afterSaleService.getDetail(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  async adminList(@Query() query: AdminAfterSaleQueryDto) {
    return this.afterSaleService.adminList(query);
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
