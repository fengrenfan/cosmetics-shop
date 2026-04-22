import { Controller, Get, Put, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateProfileDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  // ========== 管理员接口 ==========

  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  getAdminList(@Query('page') page: number, @Query('pageSize') pageSize: number) {
    return this.userService.getAdminList(page || 1, pageSize || 20);
  }
}
