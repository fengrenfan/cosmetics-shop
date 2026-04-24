import { CouponService } from './coupon.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto, GrantCouponDto } from './coupon.dto';
export declare class CouponController {
    private readonly couponService;
    constructor(couponService: CouponService);
    getAvailable(userId: number): Promise<{
        is_claimed: boolean;
        is_expired: boolean;
        is_used: boolean;
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
        auto_grant: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    claim(id: string, userId: number): Promise<{
        success: boolean;
    }>;
    validate(dto: ValidateCouponDto): Promise<import("./coupon.service").ValidationResult>;
    getMyCoupons(userId: number, status: string): Promise<{
        id: number;
        status: string;
        claimed_at: Date;
        used_at: Date;
        coupon: import("./coupon.entity").Coupon;
    }[]>;
    getAdminList(): Promise<import("./coupon.entity").Coupon[]>;
    create(dto: CreateCouponDto): Promise<import("./coupon.entity").Coupon>;
    update(id: number, dto: UpdateCouponDto): Promise<import("./coupon.entity").Coupon>;
    grant(dto: GrantCouponDto): Promise<import("./coupon.entity").UserCoupon>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
