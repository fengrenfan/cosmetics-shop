import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, DataSource } from 'typeorm';
import { Coupon, UserCoupon } from './coupon.entity';
import { COUPON_TYPE, USER_COUPON_STATUS, USER_COUPON_SOURCE, VALIDATION_ERROR_CODE, COUPON_STATUS, ONE_YEAR_MS } from './coupon.constants';
import { UpdateCouponDto } from './coupon.dto';
import { calculateDiscount, DiscountResult } from './coupon.utils';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 核销前验证（被 OrderService 调用）
   */
  async validateForOrder(userId: number, couponId: number, orderAmount: number): Promise<ValidationResult> {
    // 1. 检查优惠券是否存在
    const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
    if (!coupon) {
      return { valid: false, error: '优惠券不存在', code: VALIDATION_ERROR_CODE.NOT_FOUND };
    }

    // 2. 库存验证
    if (coupon.used_count >= coupon.total_count) {
      return { valid: false, error: '优惠券已领完', code: VALIDATION_ERROR_CODE.NO_STOCK };
    }

    // 3. 有效期验证
    const now = new Date();
    if (now < coupon.start_time || now > coupon.end_time) {
      return { valid: false, error: '优惠券已过期', code: VALIDATION_ERROR_CODE.EXPIRED };
    }

    // 4. 门槛验证
    if (orderAmount < Number(coupon.min_amount)) {
      return {
        valid: false,
        error: `订单金额需满 ${coupon.min_amount} 元`,
        code: VALIDATION_ERROR_CODE.BELOW_MIN_AMOUNT,
      };
    }

    // 5. 用户领取验证
    const userCoupon = await this.userCouponRepository.findOne({
      where: { user_id: userId, coupon_id: couponId },
    });
    if (!userCoupon) {
      return { valid: false, error: '您还未领取该优惠券', code: VALIDATION_ERROR_CODE.NOT_CLAIMED };
    }

    // 6. 使用次数验证
    if (userCoupon.status === USER_COUPON_STATUS.USED) {
      return { valid: false, error: '该优惠券已使用', code: VALIDATION_ERROR_CODE.ALREADY_USED };
    }

    if (userCoupon.status === USER_COUPON_STATUS.EXPIRED) {
      return { valid: false, error: '该优惠券已过期', code: VALIDATION_ERROR_CODE.EXPIRED };
    }

    // 7. 限次验证
    const usedCount = await this.userCouponRepository.count({
      where: { user_id: userId, coupon_id: couponId, status: USER_COUPON_STATUS.USED },
    });
    if (usedCount >= coupon.per_limit) {
      return { valid: false, error: '已达到使用上限', code: VALIDATION_ERROR_CODE.CLAIM_EXCEEDED };
    }

    return { valid: true };
  }

  /**
   * 计算优惠金额（被 OrderService 调用）
   */
  async applyToOrder(couponId: number, orderAmount: number): Promise<DiscountResult> {
    const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
    if (!coupon) {
      return { discountAmount: 0, finalAmount: orderAmount };
    }
    return calculateDiscount(coupon, orderAmount);
  }

  /**
   * 标记为已使用
   */
  async markAsUsed(userCouponId: number, orderId: number): Promise<void> {
    const userCoupon = await this.userCouponRepository.findOne({
      where: { id: userCouponId },
    });
    if (!userCoupon) {
      throw new NotFoundException('用户优惠券不存在');
    }

    userCoupon.status = USER_COUPON_STATUS.USED;
    userCoupon.used_at = new Date();
    userCoupon.order_id = orderId;
    await this.userCouponRepository.save(userCoupon);

    // 更新已使用数量
    await this.couponRepository.increment({ id: userCoupon.coupon_id }, 'used_count', 1);
  }

  /**
   * 管理员发放优惠券给用户
   */
  async grantToUser(userId: number, couponId: number): Promise<UserCoupon> {
    const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userCoupon = this.userCouponRepository.create({
        user_id: userId,
        coupon_id: couponId,
        status: USER_COUPON_STATUS.UNUSED,
        claimed_at: new Date(),
        source: USER_COUPON_SOURCE.ADMIN,
      });

      await queryRunner.manager.save(userCoupon);
      await queryRunner.manager.increment(Coupon, { id: couponId }, 'used_count', 1);

      await queryRunner.commitTransaction();
      return userCoupon;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 自动发放优惠券（新用户注册/首单触发）
   */
  async autoGrant(userId: number, trigger: number): Promise<UserCoupon[]> {
    const coupons = await this.couponRepository.find({
      where: { auto_grant: trigger, status: COUPON_STATUS.ACTIVE },
    });

    if (coupons.length === 0) {
      return [];
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const results: UserCoupon[] = [];
    const now = new Date();

    try {
      for (const coupon of coupons) {
        // 检查是否已发放过
        const existing = await queryRunner.manager.findOne(UserCoupon, {
          where: { user_id: userId, coupon_id: coupon.id },
        });
        if (existing) {
          continue;
        }

        const userCoupon = this.userCouponRepository.create({
          user_id: userId,
          coupon_id: coupon.id,
          status: USER_COUPON_STATUS.UNUSED,
          claimed_at: now,
          source: USER_COUPON_SOURCE.AUTO,
        });

        await queryRunner.manager.save(userCoupon);
        await queryRunner.manager.increment(Coupon, { id: coupon.id }, 'used_count', 1);
        results.push(userCoupon);
      }

      await queryRunner.commitTransaction();
      return results;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取可领取的优惠券
   */
  async getAvailable(userId: number) {
    const now = new Date();

    const coupons = await this.couponRepository.find({
      where: {
        status: COUPON_STATUS.ACTIVE,
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
        is_expired: userCoupon?.status === USER_COUPON_STATUS.EXPIRED,
        is_used: userCoupon?.status === USER_COUPON_STATUS.USED,
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查限领
      const userCouponCount = await queryRunner.manager.count(UserCoupon, {
        where: { user_id: userId, coupon_id: couponId },
      });

      if (userCouponCount >= coupon.per_limit) {
        throw new BadRequestException('已达到领取上限');
      }

      // 领取
      const userCoupon = this.userCouponRepository.create({
        user_id: userId,
        coupon_id: couponId,
        status: USER_COUPON_STATUS.UNUSED,
        claimed_at: now,
      });

      await queryRunner.manager.save(userCoupon);

      // 更新已使用数量
      await queryRunner.manager.increment(Coupon, { id: couponId }, 'used_count', 1);

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取我的优惠券数量
   */
  async getMyCouponCount(userId: number) {
    return this.userCouponRepository.count({ where: { user_id: userId, status: USER_COUPON_STATUS.UNUSED } });
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
      end_time: dto.end_time ? new Date(dto.end_time) : new Date(Date.now() + ONE_YEAR_MS),
      status: COUPON_STATUS.ACTIVE,
      used_count: 0,
    });
    return this.couponRepository.save(coupon);
  }

  /**
   * 更新优惠券
   */
  async update(id: number, dto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }
    // 过滤掉 undefined 的值，避免覆盖现有数据
    const updateData: Partial<Coupon> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        (updateData as any)[key] = value;
      }
    }
    // 处理日期转换
    if (updateData.start_time) coupon.start_time = new Date(updateData.start_time as any);
    if (updateData.end_time) coupon.end_time = new Date(updateData.end_time as any);
    Object.assign(coupon, updateData);
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
