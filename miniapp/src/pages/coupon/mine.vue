<template>
  <view class="container">
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <view class="coupon-list">
      <view
        v-for="item in filteredCoupons"
        :key="item.id"
        class="coupon-card"
        :class="item.status"
      >
        <view class="coupon-left">
          <view class="coupon-value">
            <text class="symbol">¥</text>
            <text class="amount">{{ item.coupon.value }}</text>
          </view>
          <view class="coupon-condition">
            <text v-if="item.coupon.min_amount > 0">满{{ item.coupon.min_amount }}可用</text>
            <text v-else>无门槛</text>
          </view>
        </view>

        <view class="coupon-right">
          <view class="coupon-title">{{ item.coupon.title }}</view>
          <view class="coupon-time">
            {{ formatTime(item.coupon.start_time) }} - {{ formatTime(item.coupon.end_time) }}
          </view>
          <view class="status-tag" :class="item.status">
            {{ getStatusText(item.status) }}
          </view>
        </view>
      </view>
    </view>

    <view v-if="filteredCoupons.length === 0" class="empty">
      <text>暂无优惠券</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onMounted } from '@dcloudio/uni-app';
import { request } from '@/utils/request';

const tabs = [
  { label: '全部', value: '' },
  { label: '待使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' },
];

const currentTab = ref('');
const myCoupons = ref([]);

async function fetchMyCoupons() {
  const userId = uni.getStorageSync('user_id');
  const res = await request.get('/coupon/my', { user_id: userId });
    myCoupons.value = res || [];
}

const filteredCoupons = computed(() => {
  if (!currentTab.value) return myCoupons.value;
  return myCoupons.value.filter(c => c.status === currentTab.value);
});

function getStatusText(status) {
  const map = { unused: '待使用', used: '已使用', expired: '已过期' };
  return map[status] || status;
}

function formatTime(time) {
  if (!time) return '';
  const d = new Date(time);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

onMounted(() => {
  fetchMyCoupons();
});
</script>

<style scoped>
.container { padding: 20rpx; background: #f5f5f5; min-height: 100vh; }
.tabs { display: flex; background: #fff; border-radius: 16rpx; margin-bottom: 20rpx; }
.tab { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: #666; }
.tab.active { color: #ff4757; border-bottom: 4rpx solid #ff4757; }
.coupon-list { display: flex; flex-direction: column; gap: 20rpx; }
.coupon-card { display: flex; background: #fff; border-radius: 16rpx; overflow: hidden; }
.coupon-left { width: 220rpx; background: linear-gradient(135deg, #ff6b6b, #ff4757); padding: 30rpx 20rpx; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.coupon-card.used .coupon-left { background: #ccc; }
.coupon-card.expired .coupon-left { background: #999; }
.coupon-value { display: flex; align-items: baseline; }
.symbol { font-size: 24rpx; }
.amount { font-size: 48rpx; font-weight: bold; }
.coupon-condition { font-size: 20rpx; margin-top: 10rpx; }
.coupon-right { flex: 1; padding: 24rpx; display: flex; flex-direction: column; justify-content: center; }
.coupon-title { font-size: 28rpx; font-weight: bold; }
.coupon-time { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.status-tag { font-size: 22rpx; margin-top: 12rpx; color: #ff4757; }
.status-tag.used { color: #999; }
.status-tag.expired { color: #999; }
.empty { text-align: center; padding: 100rpx; color: #999; }
</style>
