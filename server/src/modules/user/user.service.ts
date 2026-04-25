import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { FavoriteService } from '../favorite/favorite.service';
import { CouponService } from '../coupon/coupon.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly favoriteService: FavoriteService,
    private readonly couponService: CouponService,
    private readonly orderService: OrderService,
  ) {}

  /**
   * 创建用户（新用户注册触发自动发券）
   * @param data 用户数据
   * @param autoGrantTrigger 自动发券触发类型（1: 新用户注册, 2: 首单）
   */
  async create(data: Partial<User>, autoGrantTrigger?: number): Promise<User> {
    const user = this.userRepository.create({
      nickname: data.nickname || `用户${Date.now().toString().slice(-6)}`,
      status: 1,
      ...data,
    });
    await this.userRepository.save(user);

    // 新用户注册自动发券
    if (autoGrantTrigger) {
      await this.couponService.autoGrant(user.id, autoGrantTrigger);
    }

    return user;
  }

  /**
   * 根据 openid 查找用户
   */
  async getProfileByOpenid(openid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { openid } });
  }

  /**
   * 根据手机号查找用户
   */
  async getProfileByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(userId: number): Promise<void> {
    await this.userRepository.update(userId, { last_login_at: new Date() });
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      gender: user.gender,
    };
  }

  /**
   * 获取用户统计数据
   */
  async getStats(userId: number) {
    const [favorites, coupons, orderCount] = await Promise.all([
      this.favoriteService.getCount(userId),
      this.couponService.getMyCouponCount(userId),
      this.orderService.getCount(userId),
    ]);

    return {
      favorite_count: favorites,
      coupon_count: coupons,
      order_count: orderCount,
    };
  }

  async updateProfile(userId: number, dto: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    if (dto.nickname !== undefined) user.nickname = dto.nickname;
    if (dto.avatar !== undefined) user.avatar = dto.avatar;
    if (dto.gender !== undefined) user.gender = dto.gender;
    if (dto.phone !== undefined) user.phone = dto.phone;

    await this.userRepository.save(user);
    return { success: true };
  }

  /**
   * 获取用户列表 (管理员)
   */
  async getAdminList(page: number = 1, pageSize: number = 20) {
    const [list, total] = await this.userRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: list.map((u) => ({
        id: u.id,
        nickname: u.nickname,
        avatar: u.avatar,
        phone: u.phone,
        status: u.status,
        created_at: u.created_at,
        last_login_at: u.last_login_at,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
