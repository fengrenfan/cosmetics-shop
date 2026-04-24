import { Repository, DataSource } from 'typeorm';
import { Coupon, UserCoupon } from './coupon.entity';
import { UpdateCouponDto } from './coupon.dto';
import { DiscountResult } from './coupon.utils';
export interface ValidationResult {
    valid: boolean;
    error?: string;
    code?: string;
}
export declare class CouponService {
    private readonly couponRepository;
    private readonly userCouponRepository;
    private readonly dataSource;
    constructor(couponRepository: Repository<Coupon>, userCouponRepository: Repository<UserCoupon>, dataSource: DataSource);
    validateForOrder(userId: number, couponId: number, orderAmount: number): Promise<ValidationResult>;
    applyToOrder(couponId: number, orderAmount: number): Promise<DiscountResult>;
    markAsUsed(userCouponId: number, orderId: number): Promise<void>;
    grantToUser(userId: number, couponId: number): Promise<UserCoupon>;
    autoGrant(userId: number, trigger: number): Promise<UserCoupon[]>;
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
    claim(couponId: number, userId: number): Promise<{
        success: boolean;
    }>;
    getMyCouponCount(userId: number): Promise<number>;
    getMyCoupons(userId: number, status?: string): Promise<{
        id: number;
        status: string;
        claimed_at: Date;
        used_at: Date;
        coupon: Coupon;
    }[]>;
    getAll(): Promise<Coupon[]>;
    create(dto: {
        title: string;
        type: string;
        value: number;
        min_amount?: number;
        total_count: number;
        per_limit?: number;
        start_time?: string;
        end_time?: string;
    }): Promise<Coupon>;
    update(id: number, dto: UpdateCouponDto): Promise<Coupon>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
