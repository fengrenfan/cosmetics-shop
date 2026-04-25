"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATION_ERROR_CODE = exports.ONE_YEAR_MS = exports.AUTO_GRANT_TRIGGER = exports.COUPON_STATUS = exports.USER_COUPON_SOURCE = exports.USER_COUPON_STATUS = exports.COUPON_TYPE = void 0;
exports.COUPON_TYPE = {
    CASH: 'cash',
    DISCOUNT: 'discount',
    NO_THRESHOLD: 'noThreshold',
};
exports.USER_COUPON_STATUS = {
    UNUSED: 'unused',
    USED: 'used',
    EXPIRED: 'expired',
};
exports.USER_COUPON_SOURCE = {
    CLAIM: 'claim',
    ADMIN: 'admin',
    AUTO: 'auto',
};
exports.COUPON_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0,
};
exports.AUTO_GRANT_TRIGGER = {
    NONE: 0,
    NEW_USER: 1,
    FIRST_ORDER: 2,
};
exports.ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
exports.VALIDATION_ERROR_CODE = {
    NOT_FOUND: 'NOT_FOUND',
    NO_STOCK: 'NO_STOCK',
    EXPIRED: 'EXPIRED',
    NOT_CLAIMED: 'NOT_CLAIMED',
    BELOW_MIN_AMOUNT: 'BELOW_MIN_AMOUNT',
    ALREADY_USED: 'ALREADY_USED',
    CLAIM_EXCEEDED: 'CLAIM_EXCEEDED',
};
//# sourceMappingURL=coupon.constants.js.map