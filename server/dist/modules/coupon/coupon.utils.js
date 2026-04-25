"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiscount = calculateDiscount;
exports.isCouponValid = isCouponValid;
const coupon_constants_1 = require("./coupon.constants");
function calculateDiscount(coupon, orderAmount) {
    let discountAmount;
    switch (coupon.type) {
        case coupon_constants_1.COUPON_TYPE.CASH:
            const cashMax = coupon.max_discount == null ? coupon.value : (coupon.max_discount === 0 ? coupon.value : coupon.max_discount);
            discountAmount = Math.min(coupon.value, cashMax);
            break;
        case coupon_constants_1.COUPON_TYPE.DISCOUNT:
            const discountRate = Number(coupon.value);
            if (isNaN(discountRate) || discountRate <= 0 || discountRate >= 1) {
                discountAmount = 0;
            }
            else {
                discountAmount = orderAmount * (1 - discountRate);
                if (coupon.max_discount != null && coupon.max_discount > 0) {
                    discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
                }
            }
            break;
        case coupon_constants_1.COUPON_TYPE.NO_THRESHOLD:
            const noThresholdMax = coupon.max_discount == null ? coupon.value : (coupon.max_discount === 0 ? coupon.value : coupon.max_discount);
            discountAmount = Math.min(coupon.value, noThresholdMax);
            break;
        default:
            discountAmount = 0;
    }
    discountAmount = Math.min(discountAmount, orderAmount);
    discountAmount = Math.round(discountAmount * 100) / 100;
    return {
        discountAmount,
        finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
    };
}
function isCouponValid(coupon) {
    const now = new Date();
    return now >= coupon.start_time && now <= coupon.end_time && coupon.status === 1;
}
//# sourceMappingURL=coupon.utils.js.map