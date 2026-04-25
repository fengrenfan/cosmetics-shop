"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coupon_utils_1 = require("../coupon.utils");
const coupon_constants_1 = require("../coupon.constants");
describe('coupon.utils', () => {
    describe('calculateDiscount', () => {
        const createCoupon = (overrides = {}) => ({
            id: 1,
            title: '测试优惠券',
            type: coupon_constants_1.COUPON_TYPE.CASH,
            value: 20,
            min_amount: 0,
            max_discount: null,
            total_count: 100,
            used_count: 0,
            per_limit: 1,
            start_time: new Date('2024-01-01'),
            end_time: new Date('2024-12-31'),
            status: 1,
            auto_grant: 0,
            created_at: new Date(),
            updated_at: new Date(),
            ...overrides,
        });
        describe('满减券 (CASH)', () => {
            it('should calculate discount correctly for cash coupon', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.CASH, value: 20 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(20);
                expect(result.finalAmount).toBe(80);
            });
            it('should cap discount at max_discount', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.CASH, value: 50, max_discount: 30 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(30);
                expect(result.finalAmount).toBe(70);
            });
            it('should not exceed order amount', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.CASH, value: 150 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(100);
                expect(result.finalAmount).toBe(0);
            });
            it('should handle null max_discount (no cap)', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.CASH, value: 50, max_discount: null });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(50);
                expect(result.finalAmount).toBe(50);
            });
            it('should handle explicit max_discount of 0 (no cap)', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.CASH, value: 50, max_discount: 0 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(50);
                expect(result.finalAmount).toBe(50);
            });
        });
        describe('折扣券 (DISCOUNT)', () => {
            it('should calculate discount correctly for 20% off', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.DISCOUNT, value: 0.8 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(20);
                expect(result.finalAmount).toBe(80);
            });
            it('should cap discount at max_discount', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.DISCOUNT, value: 0.5, max_discount: 30 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(30);
                expect(result.finalAmount).toBe(70);
            });
            it('should handle null value as 0 (100% off)', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.DISCOUNT, value: null });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(0);
                expect(result.finalAmount).toBe(100);
            });
            it('should handle undefined value', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.DISCOUNT, value: undefined });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(0);
                expect(result.finalAmount).toBe(100);
            });
        });
        describe('无门槛券 (NO_THRESHOLD)', () => {
            it('should calculate discount correctly', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.NO_THRESHOLD, value: 10 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 50);
                expect(result.discountAmount).toBe(10);
                expect(result.finalAmount).toBe(40);
            });
            it('should cap at max_discount', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.NO_THRESHOLD, value: 50, max_discount: 20 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(20);
                expect(result.finalAmount).toBe(80);
            });
        });
        describe('edge cases', () => {
            it('should handle zero order amount', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.CASH, value: 20 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 0);
                expect(result.discountAmount).toBe(0);
                expect(result.finalAmount).toBe(0);
            });
            it('should round to 2 decimal places', () => {
                const coupon = createCoupon({ type: coupon_constants_1.COUPON_TYPE.DISCOUNT, value: 0.333 });
                const result = (0, coupon_utils_1.calculateDiscount)(coupon, 100);
                expect(result.discountAmount).toBe(66.7);
                expect(result.finalAmount).toBe(33.3);
            });
        });
    });
    describe('isCouponValid', () => {
        const createCoupon = (overrides = {}) => ({
            id: 1,
            title: '测试优惠券',
            type: coupon_constants_1.COUPON_TYPE.CASH,
            value: 20,
            min_amount: 0,
            max_discount: null,
            total_count: 100,
            used_count: 0,
            per_limit: 1,
            start_time: new Date('2024-01-01'),
            end_time: new Date('2024-12-31'),
            status: 1,
            auto_grant: 0,
            created_at: new Date(),
            updated_at: new Date(),
            ...overrides,
        });
        it('should return true for valid coupon within date range and status=1', () => {
            const now = new Date();
            const coupon = createCoupon({
                start_time: new Date(now.getTime() - 86400000),
                end_time: new Date(now.getTime() + 86400000),
                status: 1,
            });
            expect((0, coupon_utils_1.isCouponValid)(coupon)).toBe(true);
        });
        it('should return false if current time is before start_time', () => {
            const now = new Date();
            const coupon = createCoupon({
                start_time: new Date(now.getTime() + 86400000),
                end_time: new Date(now.getTime() + 172800000),
                status: 1,
            });
            expect((0, coupon_utils_1.isCouponValid)(coupon)).toBe(false);
        });
        it('should return false if current time is after end_time', () => {
            const now = new Date();
            const coupon = createCoupon({
                start_time: new Date(now.getTime() - 172800000),
                end_time: new Date(now.getTime() - 86400000),
                status: 1,
            });
            expect((0, coupon_utils_1.isCouponValid)(coupon)).toBe(false);
        });
        it('should return false if status is not 1', () => {
            const now = new Date();
            const coupon = createCoupon({
                start_time: new Date(now.getTime() - 86400000),
                end_time: new Date(now.getTime() + 86400000),
                status: 0,
            });
            expect((0, coupon_utils_1.isCouponValid)(coupon)).toBe(false);
        });
    });
});
//# sourceMappingURL=coupon.utils.spec.js.map