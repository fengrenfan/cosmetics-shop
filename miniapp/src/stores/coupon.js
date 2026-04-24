import { defineStore } from 'pinia';

export const useCouponStore = defineStore('coupon', {
  state: () => ({
    myCoupons: [],
    selectedCouponId: null,
  }),

  getters: {
    unusedCoupons: (state) => state.myCoupons.filter(c => c.status === 'unused'),
    usedCoupons: (state) => state.myCoupons.filter(c => c.status === 'used'),
    expiredCoupons: (state) => state.myCoupons.filter(c => c.status === 'expired'),
  },

  actions: {
    setMyCoupons(coupons) {
      this.myCoupons = coupons;
    },
    setSelectedCoupon(id) {
      this.selectedCouponId = id;
    },
    clearSelectedCoupon() {
      this.selectedCouponId = null;
    },
  },
});
