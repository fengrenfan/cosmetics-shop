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
    return this.authService.wxLogin(dto.code, dto.inviter_id);
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
    // TODO: 生产环境接入短信服务发送验证码
    const isDev = process.env.PAY_MODE === 'mock' || !process.env.SMS_ACCESS_KEY;
    if (isDev) {
      return { code: 0, message: '验证码已发送（开发环境验证码: 1234）' };
    }
    // 生产环境：调用短信API发送验证码
    return { code: 0, message: '验证码已发送' };
  }

  /**
   * 手机号验证码登录
   * POST /api/auth/phone-login
   */
  @Post('phone-login')
  async phoneLogin(@Body() dto: PhoneLoginDto) {
    return this.authService.phoneLogin(dto.phone, dto.code, dto.inviter_id);
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
