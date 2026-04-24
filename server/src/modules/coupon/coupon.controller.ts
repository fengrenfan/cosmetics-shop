import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CouponService } from './coupon.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto, GrantCouponDto } from './coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * 可领取优惠券列表 (小程序)
   * GET /api/coupon/available
   */
  @Get('available')
  async getAvailable(@Query('user_id') userId: number) {
    return this.couponService.getAvailable(userId);
  }

  /**
   * 领取优惠券
   * POST /api/coupon/claim/:id
   */
  @UseGuards(JwtAuthGuard)
  @Post('claim/:id')
  async claim(@Param('id') id: string, @Body('user_id') userId: number) {
    return this.couponService.claim(+id, userId);
  }

  /**
   * 验证优惠券是否可用（结算页调用）
   * POST /api/coupon/validate
   */
  @Post('validate')
  async validate(@Body() dto: ValidateCouponDto) {
    return this.couponService.validateForOrder(dto.user_id, dto.coupon_id, dto.order_amount);
  }

  /**
   * 我的优惠券
   * GET /api/coupon/my
   */
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyCoupons(@Query('user_id') userId: number, @Query('status') status: string) {
    return this.couponService.getMyCoupons(userId, status);
  }

  // ========== 管理员接口 ==========

  /**
   * 优惠券列表 (管理员)
   * GET /api/coupon/admin/list
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  async getAdminList() {
    return this.couponService.getAll();
  }

  /**
   * 创建优惠券 (管理员)
   * POST /api/coupon/admin
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  /**
   * 更新优惠券 (管理员)
   * PUT /api/coupon/admin/:id
   */
  @UseGuards(JwtAuthGuard)
  @Put('admin/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  /**
   * 发放优惠券给用户 (管理员)
   * POST /api/coupon/admin/grant
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/grant')
  async grant(@Body() dto: GrantCouponDto) {
    return this.couponService.grantToUser(dto.user_id, dto.coupon_id);
  }

  /**
   * 删除优惠券 (管理员)
   * DELETE /api/coupon/admin/:id
   */
  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async delete(@Param('id') id: number) {
    return this.couponService.delete(id);
  }
}
