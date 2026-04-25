// 优惠券类型
export const COUPON_TYPE = {
  CASH: 'cash',           // 满减券
  DISCOUNT: 'discount',   // 折扣券
  NO_THRESHOLD: 'noThreshold', // 无门槛券
} as const;

export type CouponType = typeof COUPON_TYPE[keyof typeof COUPON_TYPE];

// 用户券状态
export const USER_COUPON_STATUS = {
  UNUSED: 'unused',     // 待使用
  USED: 'used',         // 已使用
  EXPIRED: 'expired',    // 已过期
} as const;

export type UserCouponStatus = typeof USER_COUPON_STATUS[keyof typeof USER_COUPON_STATUS];

// 用户券来源
export const USER_COUPON_SOURCE = {
  CLAIM: 'claim',       // 主动领取
  ADMIN: 'admin',       // 管理员发放
  AUTO: 'auto',         // 自动发放
} as const;

export type UserCouponSource = typeof USER_COUPON_SOURCE[keyof typeof USER_COUPON_SOURCE];

// 优惠券状态
export const COUPON_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
} as const;

// 自动发放触发类型
export const AUTO_GRANT_TRIGGER = {
  NONE: 0,          // 不自动发放
  NEW_USER: 1,      // 新用户注册
  FIRST_ORDER: 2,   // 首单
} as const;

// 时间常量
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// 验证错误码
export const VALIDATION_ERROR_CODE = {
  NOT_FOUND: 'NOT_FOUND',
  NO_STOCK: 'NO_STOCK',
  EXPIRED: 'EXPIRED',
  NOT_CLAIMED: 'NOT_CLAIMED',
  BELOW_MIN_AMOUNT: 'BELOW_MIN_AMOUNT',
  ALREADY_USED: 'ALREADY_USED',
  CLAIM_EXCEEDED: 'CLAIM_EXCEEDED',
} as const;
