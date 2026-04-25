// coupon.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserCoupon, Coupon } from './coupon.entity';
import { USER_COUPON_STATUS } from './coupon.constants';

@Injectable()
export class CouponCron {
  private readonly logger = new Logger(CouponCron.name);

  constructor(
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  /**
   * 优惠券过期处理
   * 每天凌晨 0 点执行
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCouponExpiration() {
    this.logger.log('[Coupon Expiration] Starting...');

    try {
      const now = new Date();

      // 查找所有已过期但状态仍为 unused 的用户券
      // 先找出过期的优惠券ID
      const expiredCoupons = await this.couponRepository.find({
        select: ['id'],
        where: { end_time: LessThan(now) },
      });

      if (expiredCoupons.length === 0) {
        this.logger.log('[Coupon Expiration] No expired coupons found');
        return;
      }

      const expiredCouponIds = expiredCoupons.map(c => c.id);

      // 更新这些优惠券下状态为 unused 的用户券为过期
      const result = await this.userCouponRepository
        .createQueryBuilder('uc')
        .update(UserCoupon)
        .set({ status: USER_COUPON_STATUS.EXPIRED })
        .where('status = :status', { status: USER_COUPON_STATUS.UNUSED })
        .andWhere('coupon_id IN (:...couponIds)', { couponIds: expiredCouponIds })
        .execute();

      this.logger.log(`[Coupon Expiration] Success: ${result.affected || 0} coupons expired`);
    } catch (error) {
      this.logger.error(`[Coupon Expiration] Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 库存同步（可选）
   * 每 30 分钟执行一次
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncCouponStock() {
    try {
      const coupons = await this.couponRepository.find();

      for (const coupon of coupons) {
        const actualUsedCount = await this.userCouponRepository.count({
          where: { coupon_id: coupon.id, status: USER_COUPON_STATUS.USED },
        });

        if (coupon.used_count !== actualUsedCount) {
          await this.couponRepository.update(coupon.id, {
            used_count: actualUsedCount,
          });
          this.logger.warn(
            `[Coupon Stock Sync] Coupon #${coupon.id} corrected: ${coupon.used_count} -> ${actualUsedCount}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`[Coupon Stock Sync] Failed: ${error.message}`);
    }
  }
}
