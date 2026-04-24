import { COUPON_TYPE } from './coupon.constants';
import { Coupon } from './coupon.entity';

export interface DiscountResult {
  discountAmount: number;  // 优惠金额
  finalAmount: number;     // 最终金额
}

/**
 * 计算优惠金额
 * @param coupon 优惠券实体
 * @param orderAmount 订单金额
 * @returns 优惠结果
 */
export function calculateDiscount(coupon: Coupon, orderAmount: number): DiscountResult {
  let discountAmount: number;

  switch (coupon.type) {
    case COUPON_TYPE.CASH:
      // 满减券: 直接减免，上限 max_discount
      const cashMax = coupon.max_discount ?? coupon.value;
      discountAmount = Math.min(coupon.value, cashMax);
      break;

    case COUPON_TYPE.DISCOUNT:
      // 折扣券: 订单金额 * (1 - 折扣率)，上限 max_discount
      const discountRate = Number(coupon.value) || 0;
      discountAmount = orderAmount * (1 - discountRate);
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
      }
      break;

    case COUPON_TYPE.NO_THRESHOLD:
      // 无门槛券: 直接减免，上限 max_discount
      const noThresholdMax = coupon.max_discount ?? coupon.value;
      discountAmount = Math.min(coupon.value, noThresholdMax);
      break;

    default:
      discountAmount = 0;
  }

  // 确保优惠金额不超过订单金额
  discountAmount = Math.min(discountAmount, orderAmount);

  // 保留两位小数
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    discountAmount,
    finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
  };
}

/**
 * 检查优惠券是否在有效期内
 */
export function isCouponValid(coupon: Coupon): boolean {
  const now = new Date();
  return now >= coupon.start_time && now <= coupon.end_time && coupon.status === 1;
}
