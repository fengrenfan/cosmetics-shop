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
