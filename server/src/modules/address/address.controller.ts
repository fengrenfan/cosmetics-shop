import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * 获取地址列表
   * GET /api/address/list
   */
  @Get('list')
  async getList(@Req() req: any) {
    return this.addressService.getList(req.user.id);
  }

  /**
   * 新增地址
   * POST /api/address
   */
  @Post()
  async create(@Req() req: any, @Body() dto: CreateAddressDto) {
    return this.addressService.create({ ...dto, user_id: req.user.id });
  }

  /**
   * 更新地址
   * PUT /api/address/:id
   */
  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressService.update(+id, dto, req.user.id);
  }

  /**
   * 删除地址
   * DELETE /api/address/:id
   */
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.addressService.remove(+id, req.user.id);
  }

  /**
   * 设为默认地址
   * PUT /api/address/:id/default
   */
  @Put(':id/default')
  async setDefault(@Req() req: any, @Param('id') id: string) {
    return this.addressService.setDefault(+id, req.user.id);
  }
}
