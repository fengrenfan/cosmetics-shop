export declare const COUPON_TYPE: {
    readonly CASH: "cash";
    readonly DISCOUNT: "discount";
    readonly NO_THRESHOLD: "noThreshold";
};
export type CouponType = typeof COUPON_TYPE[keyof typeof COUPON_TYPE];
export declare const USER_COUPON_STATUS: {
    readonly UNUSED: "unused";
    readonly USED: "used";
    readonly EXPIRED: "expired";
};
export type UserCouponStatus = typeof USER_COUPON_STATUS[keyof typeof USER_COUPON_STATUS];
export declare const USER_COUPON_SOURCE: {
    readonly CLAIM: "claim";
    readonly ADMIN: "admin";
    readonly AUTO: "auto";
};
export type UserCouponSource = typeof USER_COUPON_SOURCE[keyof typeof USER_COUPON_SOURCE];
export declare const COUPON_STATUS: {
    readonly ACTIVE: 1;
    readonly INACTIVE: 0;
};
export declare const AUTO_GRANT_TRIGGER: {
    readonly NONE: 0;
    readonly NEW_USER: 1;
    readonly FIRST_ORDER: 2;
};
export declare const ONE_YEAR_MS: number;
export declare const VALIDATION_ERROR_CODE: {
    readonly NOT_FOUND: "NOT_FOUND";
    readonly NO_STOCK: "NO_STOCK";
    readonly EXPIRED: "EXPIRED";
    readonly NOT_CLAIMED: "NOT_CLAIMED";
    readonly BELOW_MIN_AMOUNT: "BELOW_MIN_AMOUNT";
    readonly ALREADY_USED: "ALREADY_USED";
    readonly CLAIM_EXCEEDED: "CLAIM_EXCEEDED";
};
