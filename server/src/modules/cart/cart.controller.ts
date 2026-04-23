import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartDto, UpdateCartDto, UpdateCheckedDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * 获取购物车列表
   * GET /api/cart/list
   * 支持游客（device_id）和登录用户
   */
  @Get('list')
  async getList(@Req() req: any) {
    const userId = req.user?.id || null;
    const deviceId = req.headers['x-device-id'] || null;
    return this.cartService.getList(userId, deviceId);
  }

  /**
   * 加入购物车
   * POST /api/cart/add
   * 支持游客（device_id）和登录用户
   */
  @Post('add')
  async add(@Body() dto: AddCartDto, @Req() req: any) {
    const userId = req.user?.id || null;
    const deviceId = req.headers['x-device-id'] || null;
    return this.cartService.add({ ...dto, user_id: userId, device_id: deviceId });
  }

  /**
   * 更新购物车数量
   * PUT /api/cart/:id
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCartDto) {
    return this.cartService.update(+id, dto);
  }

  /**
   * 删除购物车商品
   * DELETE /api/cart/:id
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }

  /**
   * 批量删除
   * DELETE /api/cart/batch
   */
  @UseGuards(JwtAuthGuard)
  @Delete('batch')
  async batchRemove(@Body('ids') ids: number[]) {
    return this.cartService.batchRemove(ids);
  }

  /**
   * 更新选中状态
   * PUT /api/cart/checked
   * 支持游客（device_id）和登录用户
   */
  @Put('checked')
  async updateChecked(@Body() dto: UpdateCheckedDto, @Req() req: any) {
    const userId = req.user?.id || null;
    const deviceId = req.headers['x-device-id'] || null;
    return this.cartService.updateChecked(dto.ids, dto.checked, userId, deviceId);
  }

  /**
   * 猜你喜欢
   * GET /api/cart/recommend
   * 根据用户购物车的商品分类查询对应商品，购物车为空则查询销量前50
   * 支持游客（device_id）和登录用户
   */
  @Get('recommend')
  async getRecommend(@Req() req: any) {
    const userId = req.user?.id || null;
    const deviceId = req.headers['x-device-id'] || null;
    return this.cartService.getRecommend(userId, deviceId);
  }
}
