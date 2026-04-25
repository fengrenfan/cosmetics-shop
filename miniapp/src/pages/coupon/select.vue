<template>
  <view class="container">
    <view class="header">
      <text class="title">选择优惠券</text>
      <text class="total">订单金额：¥{{ orderAmount }}</text>
    </view>

    <view class="coupon-list">
      <view
        v-for="item in availableCoupons"
        :key="item.id"
        class="coupon-item"
        :class="{ selected: selectedId === item.id, disabled: !item.canUse }"
        @click="handleSelect(item)"
      >
        <view class="coupon-info">
          <view class="coupon-value">¥{{ item.coupon.value }}</view>
          <view class="coupon-detail">
            <view class="coupon-title">{{ item.coupon.title }}</view>
            <view class="coupon-condition">
              <text v-if="item.coupon.min_amount > 0">满{{ item.coupon.min_amount }}元可用</text>
              <text v-else>无门槛券</text>
            </view>
          </view>
        </view>
        <view v-if="!item.canUse" class="reason">{{ item.reason }}</view>
      </view>
    </view>

    <view v-if="availableCoupons.length === 0" class="empty">
      <text>暂无可用优惠券</text>
    </view>

    <view class="footer">
      <button class="confirm-btn" @click="handleConfirm">确定</button>
      <button class="cancel-btn" @click="handleCancel">不使用优惠券</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/request';

const orderAmount = ref(0);
const selectedId = ref(null);
const availableCoupons = ref([]);

async function fetchAvailableCoupons() {
  const userId = uni.getStorageSync('user_id');
  const res = await request.get('/coupon/available', { user_id: userId });
  const coupons = res || [];

  // 处理每个券是否可用
  availableCoupons.value = coupons.map(c => {
    if (c.is_claimed && !c.is_expired && !c.is_used) {
      // 已领取且未使用，检查门槛
      if (orderAmount.value >= c.min_amount) {
        return { ...c, id: c.id, canUse: true };
      } else {
        return { ...c, id: c.id, canUse: false, reason: `订单金额不满足最低消费${c.min_amount}元` };
      }
    } else if (c.is_claimed && (c.is_expired || c.is_used)) {
      return { ...c, id: c.id, canUse: false, reason: c.is_expired ? '已过期' : '已使用' };
    } else if (!c.is_claimed) {
      return { ...c, id: c.id, canUse: false, reason: '未领取' };
    }
    return { ...c, id: c.id, canUse: false, reason: '不可用' };
  });
}

function handleSelect(item) {
  if (!item.canUse) return;
  selectedId.value = selectedId.value === item.id ? null : item.id;
}

function handleConfirm() {
  const pages = getCurrentPages();
  const prevPage = pages[pages.length - 2];
  prevPage.setData({ selectedCouponId: selectedId.value });
  uni.navigateBack();
}

function handleCancel() {
  const pages = getCurrentPages();
  const prevPage = pages[pages.length - 2];
  prevPage.setData({ selectedCouponId: null });
  uni.navigateBack();
}

onLoad((options) => {
  orderAmount.value = parseFloat(options.amount || 0);
  fetchAvailableCoupons();
});
</script>

<style scoped>
.container { display: flex; flex-direction: column; height: 100vh; background: #f5f5f5; }
.header { padding: 30rpx; background: #fff; border-bottom: 1rpx solid #eee; }
.title { font-size: 32rpx; font-weight: bold; }
.total { font-size: 28rpx; color: #ff4757; margin-left: 30rpx; }
.coupon-list { flex: 1; padding: 20rpx; overflow-y: auto; }
.coupon-item { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; display: flex; flex-direction: column; border: 2rpx solid transparent; }
.coupon-item.selected { border-color: #ff4757; }
.coupon-item.disabled { opacity: 0.5; }
.coupon-info { display: flex; }
.coupon-value { font-size: 40rpx; font-weight: bold; color: #ff4757; width: 160rpx; }
.coupon-detail { flex: 1; }
.coupon-title { font-size: 28rpx; font-weight: bold; }
.coupon-condition { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.reason { font-size: 22rpx; color: #ff6b6b; margin-top: 12rpx; }
.empty { flex: 1; display: flex; align-items: center; justify-content: center; color: #999; }
.footer { padding: 20rpx; background: #fff; display: flex; gap: 20rpx; }
.confirm-btn { flex: 1; background: #ff4757; color: #fff; border-radius: 44rpx; }
.cancel-btn { flex: 1; background: #fff; color: #666; border: 1rpx solid #ddd; border-radius: 44rpx; }
</style>