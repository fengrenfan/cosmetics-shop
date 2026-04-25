import { CouponType } from './coupon.constants';
export declare class CreateCouponDto {
    title: string;
    type: CouponType;
    value: number;
    min_amount?: number;
    max_discount?: number;
    total_count: number;
    per_limit?: number;
    start_time?: string;
    end_time?: string;
    auto_grant?: number;
    description?: string | null;
    status?: number;
}
export declare class UpdateCouponDto {
    title?: string;
    type?: CouponType;
    value?: number;
    min_amount?: number;
    max_discount?: number;
    total_count?: number;
    per_limit?: number;
    start_time?: string;
    end_time?: string;
    status?: number;
    auto_grant?: number | null;
    description?: string | null;
}
export declare class ValidateCouponDto {
    user_id?: number;
    coupon_id: number;
    order_amount: number;
}
export declare class ApplyCouponDto {
    coupon_id: number;
    order_amount: number;
}
export declare class MarkUsedDto {
    user_coupon_id: number;
    order_id: number;
}
export declare class GrantCouponDto {
    user_id: number;
    coupon_id: number;
}
