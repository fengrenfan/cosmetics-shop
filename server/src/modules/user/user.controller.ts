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

  /**
   * 获取用户统计数据
   * GET /api/user/stats
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req) {
    return this.userService.getStats(req.user.id);
  }

  // ========== 管理员接口 ==========

  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  getAdminList(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('id') id?: string,
    @Query('phone') phone?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};
    if (id) filters.id = parseInt(id);
    if (phone) filters.phone = phone;
    if (status !== undefined && status !== '' && status !== null) filters.status = parseInt(status);
    return this.userService.getAdminList(page || 1, pageSize || 20, filters);
  }

  /**
   * 搜索用户 (管理员)
   * GET /api/user/admin/search?phone=xxx
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/search')
  async search(@Query('phone') phone: string) {
    if (!phone) {
      return { data: null };
    }
    const user = await this.userService.getProfileByPhone(phone);
    if (!user) {
      return { data: null };
    }
    return {
      data: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        avatar: user.avatar,
      }
    };
  }

  /**
   * 获取用户详情 (管理员)
   * GET /api/user/admin/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  async getAdminDetail(@Param('id') id: number) {
    return this.userService.getAdminDetail(id);
  }

  /**
   * 切换用户状态 (管理员)
   * PUT /api/user/admin/:id/status
   */
  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/status')
  async toggleStatus(@Param('id') id: number, @Body('status') status: number) {
    return this.userService.toggleStatus(id, status);
  }

}