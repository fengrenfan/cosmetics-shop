import { Repository } from 'typeorm';
import { UserCoupon, Coupon } from './coupon.entity';
export declare class CouponCron {
    private readonly userCouponRepository;
    private readonly couponRepository;
    private readonly logger;
    constructor(userCouponRepository: Repository<UserCoupon>, couponRepository: Repository<Coupon>);
    handleCouponExpiration(): Promise<void>;
    syncCouponStock(): Promise<void>;
}
