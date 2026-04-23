import { Repository } from 'typeorm';
import { Coupon, UserCoupon } from './coupon.entity';
export declare class CouponService {
    private readonly couponRepository;
    private readonly userCouponRepository;
    constructor(couponRepository: Repository<Coupon>, userCouponRepository: Repository<UserCoupon>);
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
    update(id: number, dto: any): Promise<Coupon>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
