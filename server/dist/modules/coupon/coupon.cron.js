"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CouponCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("./coupon.entity");
const coupon_constants_1 = require("./coupon.constants");
let CouponCron = CouponCron_1 = class CouponCron {
    constructor(userCouponRepository, couponRepository) {
        this.userCouponRepository = userCouponRepository;
        this.couponRepository = couponRepository;
        this.logger = new common_1.Logger(CouponCron_1.name);
    }
    async handleCouponExpiration() {
        this.logger.log('[Coupon Expiration] Starting...');
        try {
            const now = new Date();
            const expiredCoupons = await this.couponRepository.find({
                select: ['id'],
                where: { end_time: (0, typeorm_2.LessThan)(now) },
            });
            if (expiredCoupons.length === 0) {
                this.logger.log('[Coupon Expiration] No expired coupons found');
                return;
            }
            const expiredCouponIds = expiredCoupons.map(c => c.id);
            const result = await this.userCouponRepository
                .createQueryBuilder('uc')
                .update(coupon_entity_1.UserCoupon)
                .set({ status: coupon_constants_1.USER_COUPON_STATUS.EXPIRED })
                .where('status = :status', { status: coupon_constants_1.USER_COUPON_STATUS.UNUSED })
                .andWhere('coupon_id IN (:...couponIds)', { couponIds: expiredCouponIds })
                .execute();
            this.logger.log(`[Coupon Expiration] Success: ${result.affected || 0} coupons expired`);
        }
        catch (error) {
            this.logger.error(`[Coupon Expiration] Failed: ${error.message}`);
            throw error;
        }
    }
    async syncCouponStock() {
        try {
            const coupons = await this.couponRepository.find();
            for (const coupon of coupons) {
                const actualUsedCount = await this.userCouponRepository.count({
                    where: { coupon_id: coupon.id, status: coupon_constants_1.USER_COUPON_STATUS.USED },
                });
                if (coupon.used_count !== actualUsedCount) {
                    await this.couponRepository.update(coupon.id, {
                        used_count: actualUsedCount,
                    });
                    this.logger.warn(`[Coupon Stock Sync] Coupon #${coupon.id} corrected: ${coupon.used_count} -> ${actualUsedCount}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`[Coupon Stock Sync] Failed: ${error.message}`);
        }
    }
};
exports.CouponCron = CouponCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CouponCron.prototype, "handleCouponExpiration", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CouponCron.prototype, "syncCouponStock", null);
exports.CouponCron = CouponCron = CouponCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.UserCoupon)),
    __param(1, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CouponCron);
//# sourceMappingURL=coupon.cron.js.map