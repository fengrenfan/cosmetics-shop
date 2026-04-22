<template>
  <view class="page">
    <!-- Tab栏 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'available' }"
        @click="onTabChange('available')"
      >
        <text>可领取</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'unused' }"
        @click="onTabChange('unused')"
      >
        <text>未使用</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'used' }"
        @click="onTabChange('used')"
      >
        <text>已使用</text>
      </view>
    </view>

    <!-- 可领取优惠券 -->
    <scroll-view class="coupon-list" scroll-y v-if="currentTab === 'available'">
      <view class="coupon-item available" v-for="item in availableList" :key="item.id">
        <view class="coupon-left">
          <text class="coupon-value">
            <text class="unit">¥</text>{{ item.value }}
          </text>
          <text class="coupon-condition" v-if="item.min_amount > 0">满{{ item.min_amount }}可用</text>
          <text class="coupon-condition" v-else>无门槛</text>
        </view>
        <view class="coupon-right">
          <text class="coupon-title">{{ item.title }}</text>
          <text class="coupon-time">{{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}</text>
          <view class="coupon-btn" v-if="item.can_claim" @click="claimCoupon(item)">立即领取</view>
          <view class="coupon-btn disabled" v-else-if="item.is_expired">已过期</view>
          <view class="coupon-btn disabled" v-else>已领取</view>
        </view>
      </view>

      <view class="empty-state" v-if="availableList.length === 0 && !loading">
        <text>暂无可领取的优惠券</text>
      </view>
    </scroll-view>

    <!-- 未使用优惠券 -->
    <scroll-view class="coupon-list" scroll-y v-if="currentTab === 'unused'">
      <view class="coupon-item" v-for="item in myCouponList.filter(c => c.status === 'unused')" :key="item.id">
        <view class="coupon-left">
          <text class="coupon-value">
            <text class="unit">¥</text>{{ item.coupon.value }}
          </text>
          <text class="coupon-condition" v-if="item.coupon.min_amount > 0">满{{ item.coupon.min_amount }}可用</text>
          <text class="coupon-condition" v-else>无门槛</text>
        </view>
        <view class="coupon-right">
          <text class="coupon-title">{{ item.coupon.title }}</text>
          <text class="coupon-time">{{ formatTime(item.coupon.start_time) }} - {{ formatTime(item.coupon.end_time) }}</text>
          <view class="coupon-status">未使用</view>
        </view>
      </view>

      <view class="empty-state" v-if="myCouponList.filter(c => c.status === 'unused').length === 0 && !loading">
        <text>暂无未使用优惠券</text>
      </view>
    </scroll-view>

    <!-- 已使用/已过期 -->
    <scroll-view class="coupon-list" scroll-y v-if="currentTab === 'used'">
      <view class="coupon-item used" v-for="item in myCouponList.filter(c => c.status !== 'unused')" :key="item.id">
        <view class="coupon-left">
          <text class="coupon-value">
            <text class="unit">¥</text>{{ item.coupon.value }}
          </text>
          <text class="coupon-condition" v-if="item.coupon.min_amount > 0">满{{ item.coupon.min_amount }}可用</text>
          <text class="coupon-condition" v-else>无门槛</text>
        </view>
        <view class="coupon-right">
          <text class="coupon-title">{{ item.coupon.title }}</text>
          <text class="coupon-time">{{ formatTime(item.coupon.start_time) }} - {{ formatTime(item.coupon.end_time) }}</text>
          <view class="coupon-status disabled">{{ item.status === 'used' ? '已使用' : '已过期' }}</view>
        </view>
      </view>

      <view class="empty-state" v-if="myCouponList.filter(c => c.status !== 'unused').length === 0 && !loading">
        <text>暂无历史优惠券</text>
      </view>
    </scroll-view>

    <view class="loading-state" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request.js';

const currentTab = ref('available');
const availableList = ref([]);
const myCouponList = ref([]);
const loading = ref(false);

onShow(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const [availableRes, myRes] = await Promise.all([
      request.get('/coupon/available'),
      request.get('/coupon/my')
    ]);
    availableList.value = availableRes || [];
    myCouponList.value = myRes || [];
  } catch (e) {
    console.error('加载优惠券失败', e);
  } finally {
    loading.value = false;
  }
}

function onTabChange(tab) {
  currentTab.value = tab;
}

async function claimCoupon(item) {
  try {
    await request.post(`/coupon/claim/${item.id}`);
    uni.showToast({ title: '领取成功', icon: 'success' });
    
    // 更新列表状态
    const index = availableList.value.findIndex(c => c.id === item.id);
    if (index > -1) {
      availableList.value[index].can_claim = false;
      availableList.value[index].is_claimed = true;
    }
    
    // 刷新我的优惠券
    const myRes = await request.get('/coupon/my');
    myCouponList.value = myRes || [];
  } catch (e) {
    console.error('领取失败', e);
  }
}

function formatTime(time) {
  if (!time) return '';
  const date = new Date(time);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.tabs {
  display: flex;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
  
  text {
    font-size: 28rpx;
    color: #666;
  }
  
  &.active {
    text {
      color: #ff4a8d;
      font-weight: bold;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #ff4a8d;
      border-radius: 2rpx;
    }
  }
}

.coupon-list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.coupon-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  
  &.available {
    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  }
  
  &.used {
    opacity: 0.5;
    
    .coupon-left {
      background: #ccc;
    }
  }
}

.coupon-left {
  width: 220rpx;
  padding: 30rpx 20rpx;
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.coupon-value {
  font-size: 56rpx;
  color: #fff;
  font-weight: bold;
  
  .unit {
    font-size: 28rpx;
  }
}

.coupon-condition {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.coupon-right {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coupon-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.coupon-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.coupon-btn {
  align-self: flex-start;
  margin-top: 16rpx;
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  color: #fff;
  border-radius: 32rpx;
  font-size: 24rpx;
  
  &.disabled {
    background: #ccc;
  }
}

.coupon-status {
  align-self: flex-start;
  margin-top: 16rpx;
  padding: 8rpx 24rpx;
  background: #ffe6f0;
  color: #ff4a8d;
  border-radius: 32rpx;
  font-size: 22rpx;
  
  &.disabled {
    background: #f5f5f5;
    color: #999;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  
  text {
    font-size: 28rpx;
    color: #999;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 30rpx;
  
  text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>
