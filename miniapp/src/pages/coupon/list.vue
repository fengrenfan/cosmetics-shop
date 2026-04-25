<template>
  <view class="container">
    <view class="coupon-list">
      <view
        v-for="coupon in availableCoupons"
        :key="coupon.id"
        class="coupon-card"
        :class="{ disabled: coupon.is_claimed }"
      >
        <view class="coupon-left">
          <view class="coupon-value">
            <text class="symbol">¥</text>
            <text class="amount">{{ coupon.value }}</text>
            <text class="type-text">{{ getCouponTypeText(coupon.type) }}</text>
          </view>
          <view class="coupon-condition">
            <text v-if="coupon.min_amount > 0">满{{ coupon.min_amount }}元可用</text>
            <text v-else>无门槛</text>
          </view>
        </view>

        <view class="coupon-right">
          <view class="coupon-title">{{ coupon.title }}</view>
          <view class="coupon-time">
            {{ formatTime(coupon.start_time) }} - {{ formatTime(coupon.end_time) }}
          </view>
          <button
            class="claim-btn"
            :disabled="coupon.is_claimed || !coupon.can_claim"
            @click="handleClaim(coupon.id)"
          >
            {{ coupon.is_claimed ? '已领取' : coupon.can_claim ? '立即领取' : '已领完' }}
          </button>
        </view>
      </view>
    </view>

    <view v-if="availableCoupons.length === 0" class="empty">
      <text>暂无优惠券</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from '@dcloudio/uni-app';
import { request } from '@/utils/request';

const availableCoupons = ref([]);

async function fetchAvailableCoupons() {
  const userId = uni.getStorageSync('user_id');
  const res = await request.get('/coupon/available', { user_id: userId });
  availableCoupons.value = res.data || res || [];
}

async function handleClaim(couponId) {
  try {
    await request.post(`/coupon/claim/${couponId}`, { user_id: uni.getStorageSync('user_id') });
    uni.showToast({ title: '领取成功', icon: 'success' });
    fetchAvailableCoupons();
  } catch (e) {
    uni.showToast({ title: e.message || '领取失败', icon: 'none' });
  }
}

function getCouponTypeText(type) {
  const map = { cash: '满减', discount: '折扣', noThreshold: '无门槛' };
  return map[type] || type;
}

function formatTime(time) {
  if (!time) return '';
  const d = new Date(time);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

uni.$on('refreshCouponList', () => {
  fetchAvailableCoupons();
});

onMounted(() => {
  fetchAvailableCoupons();
});
</script>

<style scoped>
.container { padding: 20rpx; background: #f5f5f5; min-height: 100vh; }
.coupon-list { display: flex; flex-direction: column; gap: 20rpx; }
.coupon-card { display: flex; background: #fff; border-radius: 16rpx; overflow: hidden; }
.coupon-card.disabled { opacity: 0.6; }
.coupon-left { width: 240rpx; background: linear-gradient(135deg, #ff6b6b, #ff4757); padding: 30rpx 20rpx; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.coupon-value { display: flex; align-items: baseline; }
.symbol { font-size: 28rpx; }
.amount { font-size: 56rpx; font-weight: bold; }
.type-text { font-size: 24rpx; margin-left: 8rpx; }
.coupon-condition { font-size: 22rpx; margin-top: 10rpx; }
.coupon-right { flex: 1; padding: 24rpx; display: flex; flex-direction: column; justify-content: space-between; }
.coupon-title { font-size: 28rpx; font-weight: bold; }
.coupon-time { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.claim-btn { width: 160rpx; height: 56rpx; line-height: 56rpx; background: #ff4757; color: #fff; font-size: 24rpx; border-radius: 28rpx; margin-top: 16rpx; }
.claim-btn[disabled] { background: #ccc; }
.empty { text-align: center; padding: 100rpx; color: #999; }
</style>
