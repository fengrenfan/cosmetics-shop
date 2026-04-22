import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { WxLoginDto, AdminLoginDto, SendCodeDto, PhoneLoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 微信小程序登录
   * POST /api/auth/wx-login
   */
  @Post('wx-login')
  async wxLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto.code);
  }

  /**
   * 管理员登录
   * POST /api/auth/admin-login
   */
  @Post('admin-login')
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto.username, dto.password);
  }

  /**
   * 发送验证码（开发环境固定返回1234）
   * POST /api/auth/send-code
   */
  @Post('send-code')
  async sendCode(@Body() dto: SendCodeDto) {
    // 开发环境固定验证码
    return { code: 0, message: 'success', data: { code: '1234' } };
  }

  /**
   * 手机号验证码登录
   * POST /api/auth/phone-login
   */
  @Post('phone-login')
  async phoneLogin(@Body() dto: PhoneLoginDto) {
    return this.authService.phoneLogin(dto.phone, dto.code);
  }

  /**
   * 刷新Token
   * POST /api/auth/refresh
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  /**
   * 获取当前用户信息
   * GET /api/auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
