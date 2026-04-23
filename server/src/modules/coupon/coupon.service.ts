import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Coupon, UserCoupon } from './coupon.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
  ) {}

  /**
   * 获取可领取的优惠券
   */
  async getAvailable(userId: number) {
    const now = new Date();

    const coupons = await this.couponRepository.find({
      where: {
        status: 1,
        start_time: LessThanOrEqual(now),
        end_time: MoreThanOrEqual(now),
      },
      order: { created_at: 'DESC' },
    });

    // 获取用户已领取的
    const userCoupons = await this.userCouponRepository.find({
      where: { user_id: userId },
    });

    const claimedMap = new Map(userCoupons.map((uc) => [uc.coupon_id, uc]));

    return coupons.map((c) => {
      const userCoupon = claimedMap.get(c.id);
      return {
        ...c,
        is_claimed: !!userCoupon,
        is_expired: userCoupon?.status === 'expired',
        can_claim: !userCoupon && (c.total_count - c.used_count) > 0,
      };
    });
  }

  /**
   * 领取优惠券
   */
  async claim(couponId: number, userId: number) {
    const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    const now = new Date();
    if (now < coupon.start_time || now > coupon.end_time) {
      throw new BadRequestException('优惠券不在领取时间内');
    }

    if (coupon.used_count >= coupon.total_count) {
      throw new BadRequestException('优惠券已领完');
    }

    // 检查限领
    const userCouponCount = await this.userCouponRepository.count({
      where: { user_id: userId, coupon_id: couponId },
    });

    if (userCouponCount >= coupon.per_limit) {
      throw new BadRequestException('已达到领取上限');
    }

    // 领取
    const userCoupon = this.userCouponRepository.create({
      user_id: userId,
      coupon_id: couponId,
      status: 'unused',
      claimed_at: now,
    });

    await this.userCouponRepository.save(userCoupon);

    // 更新已使用数量
    await this.couponRepository.increment({ id: couponId }, 'used_count', 1);

    return { success: true };
  }

  /**
   * 获取我的优惠券数量
   */
  async getMyCouponCount(userId: number) {
    return this.userCouponRepository.count({ where: { user_id: userId, status: 'unused' } });
  }

  /**
   * 获取我的优惠券
   */
  async getMyCoupons(userId: number, status?: string) {
    const qb = this.userCouponRepository
      .createQueryBuilder('uc')
      .leftJoinAndSelect('uc.coupon', 'coupon')
      .where('uc.user_id = :userId', { userId });

    if (status) {
      qb.andWhere('uc.status = :status', { status });
    }

    const list = await qb.orderBy('uc.claimed_at', 'DESC').getMany();

    return list.map((uc) => ({
      id: uc.id,
      status: uc.status,
      claimed_at: uc.claimed_at,
      used_at: uc.used_at,
      coupon: uc.coupon,
    }));
  }

  // ========== 管理员接口 ==========

  /**
   * 获取所有优惠券 (管理员)
   */
  async getAll() {
    return this.couponRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 创建优惠券
   */
  async create(dto: {
    title: string;
    type: string;
    value: number;
    min_amount?: number;
    total_count: number;
    per_limit?: number;
    start_time?: string;
    end_time?: string;
  }) {
    const coupon = this.couponRepository.create({
      title: dto.title,
      type: dto.type,
      value: dto.value,
      min_amount: dto.min_amount || 0,
      total_count: dto.total_count,
      per_limit: dto.per_limit || 1,
      start_time: dto.start_time ? new Date(dto.start_time) : new Date(),
      end_time: dto.end_time ? new Date(dto.end_time) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 1,
      used_count: 0,
    });
    return this.couponRepository.save(coupon);
  }

  /**
   * 更新优惠券
   */
  async update(id: number, dto: any) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }
    Object.assign(coupon, dto);
    if (dto.start_time) coupon.start_time = new Date(dto.start_time);
    if (dto.end_time) coupon.end_time = new Date(dto.end_time);
    return this.couponRepository.save(coupon);
  }

  /**
   * 删除优惠券
   */
  async delete(id: number) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }
    await this.couponRepository.delete(id);
    return { success: true };
  }
}
