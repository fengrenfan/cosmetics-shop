"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coupon_controller_1 = require("../coupon.controller");
describe('CouponController user id fallback', () => {
    const couponService = {
        getAvailable: jest.fn(),
        claim: jest.fn(),
        getMyCoupons: jest.fn(),
    };
    let controller;
    beforeEach(() => {
        jest.clearAllMocks();
        controller = new coupon_controller_1.CouponController(couponService);
    });
    it('uses jwt user id for getAvailable when query user_id missing', async () => {
        await controller.getAvailable(undefined, { user: { id: 101 } });
        expect(couponService.getAvailable).toHaveBeenCalledWith(101);
    });
    it('uses jwt user id for claim when body user_id missing', async () => {
        await controller.claim('12', undefined, { user: { id: 102 } });
        expect(couponService.claim).toHaveBeenCalledWith(12, 102);
    });
    it('uses jwt user id for getMyCoupons when query user_id missing', async () => {
        await controller.getMyCoupons(undefined, 'unused', { user: { id: 103 } });
        expect(couponService.getMyCoupons).toHaveBeenCalledWith(103, 'unused');
    });
});
//# sourceMappingURL=coupon.controller.spec.js.map