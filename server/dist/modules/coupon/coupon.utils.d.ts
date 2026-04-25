import { Coupon } from './coupon.entity';
export interface DiscountResult {
    discountAmount: number;
    finalAmount: number;
}
export declare function calculateDiscount(coupon: Coupon, orderAmount: number): DiscountResult;
export declare function isCouponValid(coupon: Coupon): boolean;
