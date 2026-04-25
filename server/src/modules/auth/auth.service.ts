import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 微信登录
   * code -> openid -> JWT
   */
  async wxLogin(code: string) {
    // 1. 通过 code 调用微信接口获取 openid
    const openid = await this.getWxOpenid(code);

    // 2. 查找或创建用户
    let user = await this.userService.getProfileByOpenid(openid);

    if (!user) {
      // 新用户创建时自动发券（trigger = 1）
      user = await this.userService.create({ openid }, 1);
    }

    // 3. 生成 Token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
      },
    };
  }

  /**
   * 管理员登录
   */
  async adminLogin(username: string, password: string) {
    // 测试账号：admin / admin123
    if (username === 'admin' && password === 'admin123') {
      // 查找或创建管理员用户
      let user = await this.userService.getProfileByPhone('admin');

      if (!user) {
        // 创建管理员用户
        const passwordHash = await bcrypt.hash('admin123', 10);
        user = await this.userService.create({
          nickname: '管理员',
          phone: 'admin',
          password_hash: passwordHash,
        });
      }

      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
        },
      };
    }

    // 普通用户手机号登录
    const user = await this.userService.getProfileByPhone(username);

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('账号或密码错误');
    }

    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 更新登录信息
    await this.userService.updateLastLogin(user.id);

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
      },
    };
  }

  /**
   * 手机号验证码登录
   */
  async phoneLogin(phone: string, code: string) {
    // 开发环境验证码固定为 1234
    if (code !== '1234') {
      throw new UnauthorizedException('验证码错误');
    }

    // 查找或创建用户
    let user = await this.userService.getProfileByPhone(phone);

    if (!user) {
      // 新用户创建时自动发券（trigger = 1）
      user = await this.userService.create({ phone }, 1);
    }

    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 更新登录信息
    await this.userService.updateLastLogin(user.id);

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
      },
    };
  }

  /**
   * 获取用户信息
   */
  async getProfile(userId: number) {
    const user = await this.userService.getProfile(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }

  /**
   * 刷新 Token
   */
  async refreshToken(user: any) {
    const userEntity = await this.userService.getProfile(user.id);
    if (!userEntity) {
      throw new UnauthorizedException('用户不存在');
    }
    return { token: this.generateToken(userEntity) };
  }

  /**
   * 生成 JWT Token
   */
  private generateToken(user: any): string {
    return this.jwtService.sign({
      id: user.id,
      openid: user.openid,
      phone: user.phone,
    });
  }

  /**
   * 调用微信接口获取 openid
   */
  private async getWxOpenid(code: string): Promise<string> {
    const appid = process.env.WX_APPID;
    const secret = process.env.WX_SECRET;

    // 测试环境使用模拟 openid
    if (!appid || !secret) {
      return `mock_openid_${code}`;
    }

    try {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
      const response = await axios.get(url);

      if (response.data.errcode) {
        throw new Error(response.data.errmsg);
      }

      return response.data.openid;
    } catch (error) {
      throw new UnauthorizedException('微信登录失败');
    }
  }
}
