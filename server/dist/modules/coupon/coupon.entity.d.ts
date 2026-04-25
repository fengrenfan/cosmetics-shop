export declare class Coupon {
    id: number;
    title: string;
    type: string;
    value: number;
    min_amount: number;
    max_discount: number;
    total_count: number;
    used_count: number;
    per_limit: number;
    start_time: Date;
    end_time: Date;
    status: number;
    auto_grant: number;
    description: string;
    created_at: Date;
    updated_at: Date;
}
export declare class UserCoupon {
    id: number;
    user_id: number;
    coupon_id: number;
    status: string;
    claimed_at: Date;
    used_at: Date;
    order_id: number;
    source: string;
    coupon: Coupon;
}
