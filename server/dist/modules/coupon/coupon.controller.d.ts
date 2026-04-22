import { CouponService } from './coupon.service';
export declare class CouponController {
    private readonly couponService;
    constructor(couponService: CouponService);
    getAvailable(userId: number): Promise<{
        is_claimed: boolean;
        is_expired: boolean;
        can_claim: boolean;
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
        created_at: Date;
        updated_at: Date;
    }[]>;
    claim(id: string, userId: number): Promise<{
        success: boolean;
    }>;
    getMyCoupons(userId: number, status: string): Promise<{
        id: number;
        status: string;
        claimed_at: Date;
        used_at: Date;
        coupon: import("./coupon.entity").Coupon;
    }[]>;
    getAdminList(): Promise<import("./coupon.entity").Coupon[]>;
    create(dto: {
        title: string;
        type: string;
        value: number;
        min_amount?: number;
        total_count: number;
        per_limit?: number;
        start_time?: string;
        end_time?: string;
    }): Promise<import("./coupon.entity").Coupon>;
    update(id: number, dto: any): Promise<import("./coupon.entity").Coupon>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
