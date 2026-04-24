import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { User } from '../user/user.entity';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly couponService: CouponService,
  ) {}

  /**
   * 微信登录
   * code -> openid -> JWT
   */
  async wxLogin(code: string) {
    // 1. 通过 code 调用微信接口获取 openid
    const openid = await this.getWxOpenid(code);
    
    // 2. 查找或创建用户
    let user = await this.userRepository.findOne({ where: { openid } });
    
    if (!user) {
      user = this.userRepository.create({
        openid,
        nickname: `用户${Date.now().toString().slice(-6)}`,
        status: 1,
      });
      await this.userRepository.save(user);
      // 新用户注册自动发券（trigger = 1）
      await this.couponService.autoGrant(user.id, 1);
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
      let user = await this.userRepository.findOne({ where: { phone: 'admin' } });
      
      if (!user) {
        // 创建管理员用户
        const passwordHash = await bcrypt.hash('admin123', 10);
        user = this.userRepository.create({
          nickname: '管理员',
          phone: 'admin',
          password_hash: passwordHash,
          status: 1,
        });
        await this.userRepository.save(user);
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
    const user = await this.userRepository.findOne({ 
      where: { phone: username } 
    });

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
    user.last_login_at = new Date();
    await this.userRepository.save(user);

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
    let user = await this.userRepository.findOne({ where: { phone } });

    if (!user) {
      user = this.userRepository.create({
        phone,
        nickname: `用户${phone.slice(-4)}`,
        status: 1,
      });
      await this.userRepository.save(user);
      // 新用户注册自动发券（trigger = 1）
      await this.couponService.autoGrant(user.id, 1);
    }

    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 更新登录信息
    user.last_login_at = new Date();
    await this.userRepository.save(user);

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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      gender: user.gender,
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(user: any) {
    const userEntity = await this.userRepository.findOne({ where: { id: user.id } });
    if (!userEntity) {
      throw new UnauthorizedException('用户不存在');
    }
    return { token: this.generateToken(userEntity) };
  }

  /**
   * 生成 JWT Token
   */
  private generateToken(user: User): string {
    return this.jwtService.sign({
      id: user.id,
      openid: user.openid,
      phone: user.phone,
    });
  }

  /**
   * 调用微信接口获取 openid
   * 文档: https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
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
