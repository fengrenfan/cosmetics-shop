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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("./coupon.entity");
let CouponService = class CouponService {
    constructor(couponRepository, userCouponRepository) {
        this.couponRepository = couponRepository;
        this.userCouponRepository = userCouponRepository;
    }
    async getAvailable(userId) {
        const now = new Date();
        const coupons = await this.couponRepository.find({
            where: {
                status: 1,
                start_time: (0, typeorm_2.LessThanOrEqual)(now),
                end_time: (0, typeorm_2.MoreThanOrEqual)(now),
            },
            order: { created_at: 'DESC' },
        });
        const userCoupons = await this.userCouponRepository.find({
            where: { user_id: userId },
        });
        const claimedMap = new Map(userCoupons.map((uc) => [uc.coupon_id, uc]));
        return coupons.map((c) => {
            const userCoupon = claimedMap.get(c.id);
            return {
                ...c,
                is_claimed: !!userCoupon,
                is_expired: userCoupon?.status === 'expired',
                can_claim: !userCoupon && (c.total_count - c.used_count) > 0,
            };
        });
    }
    async claim(couponId, userId) {
        const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
        if (!coupon) {
            throw new common_1.NotFoundException('优惠券不存在');
        }
        const now = new Date();
        if (now < coupon.start_time || now > coupon.end_time) {
            throw new common_1.BadRequestException('优惠券不在领取时间内');
        }
        if (coupon.used_count >= coupon.total_count) {
            throw new common_1.BadRequestException('优惠券已领完');
        }
        const userCouponCount = await this.userCouponRepository.count({
            where: { user_id: userId, coupon_id: couponId },
        });
        if (userCouponCount >= coupon.per_limit) {
            throw new common_1.BadRequestException('已达到领取上限');
        }
        const userCoupon = this.userCouponRepository.create({
            user_id: userId,
            coupon_id: couponId,
            status: 'unused',
            claimed_at: now,
        });
        await this.userCouponRepository.save(userCoupon);
        await this.couponRepository.increment({ id: couponId }, 'used_count', 1);
        return { success: true };
    }
    async getMyCouponCount(userId) {
        return this.userCouponRepository.count({ where: { user_id: userId, status: 'unused' } });
    }
    async getMyCoupons(userId, status) {
        const qb = this.userCouponRepository
            .createQueryBuilder('uc')
            .leftJoinAndSelect('uc.coupon', 'coupon')
            .where('uc.user_id = :userId', { userId });
        if (status) {
            qb.andWhere('uc.status = :status', { status });
        }
        const list = await qb.orderBy('uc.claimed_at', 'DESC').getMany();
        return list.map((uc) => ({
            id: uc.id,
            status: uc.status,
            claimed_at: uc.claimed_at,
            used_at: uc.used_at,
            coupon: uc.coupon,
        }));
    }
    async getAll() {
        return this.couponRepository.find({
            order: { created_at: 'DESC' },
        });
    }
    async create(dto) {
        const coupon = this.couponRepository.create({
            title: dto.title,
            type: dto.type,
            value: dto.value,
            min_amount: dto.min_amount || 0,
            total_count: dto.total_count,
            per_limit: dto.per_limit || 1,
            start_time: dto.start_time ? new Date(dto.start_time) : new Date(),
            end_time: dto.end_time ? new Date(dto.end_time) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 1,
            used_count: 0,
        });
        return this.couponRepository.save(coupon);
    }
    async update(id, dto) {
        const coupon = await this.couponRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('优惠券不存在');
        }
        Object.assign(coupon, dto);
        if (dto.start_time)
            coupon.start_time = new Date(dto.start_time);
        if (dto.end_time)
            coupon.end_time = new Date(dto.end_time);
        return this.couponRepository.save(coupon);
    }
    async delete(id) {
        const coupon = await this.couponRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('优惠券不存在');
        }
        await this.couponRepository.delete(id);
        return { success: true };
    }
};
exports.CouponService = CouponService;
exports.CouponService = CouponService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __param(1, (0, typeorm_1.InjectRepository)(coupon_entity_1.UserCoupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CouponService);
//# sourceMappingURL=coupon.service.js.map