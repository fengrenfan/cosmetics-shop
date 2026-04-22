<template>
  <view class="page">
    <!-- 用户信息头部 -->
    <view class="user-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-bg"></view>
      <view class="user-info" @click="handleUserClick">
        <!-- 头像 -->
        <view class="avatar-wrap">
          <image
            class="user-avatar"
            :src="userInfo?.avatar || '/static/default-avatar.png'"
            mode="aspectFill"
          />
          <view class="plus-badge">PLUS</view>
        </view>
        <!-- 用户信息 -->
        <view class="user-detail">
          <text class="user-name">{{ userInfo?.nickname || '点击登录' }}</text>
          <view class="user-level">
            <text class="iconfont star" style="font-size: 22rpx; color: rgba(255,255,255,0.7);"></text>
            <text class="level-text">黄金会员</text>
            <text class="iconfont chevron_right" style="font-size: 24rpx; color: rgba(255,255,255,0.6);"></text>
          </view>
        </view>
      </view>
      <!-- 装饰圆 -->
      <view class="header-glow"></view>
    </view>

    <!-- 资产卡片（悬浮效果） -->
    <view class="asset-card">
      <view class="asset-item">
        <text class="asset-num">{{ userInfo?.coupon_count || 0 }}</text>
        <text class="asset-label">优惠券</text>
      </view>
      <view class="asset-divider"></view>
      <view class="asset-item">
        <text class="asset-num">{{ userInfo?.points || '0' }}</text>
        <text class="asset-label">积分</text>
      </view>
      <view class="asset-divider"></view>
      <view class="asset-item">
        <text class="asset-num">¥{{ userInfo?.balance || '0.00' }}</text>
        <text class="asset-label">余额</text>
      </view>
    </view>

    <!-- 我的订单 -->
    <view class="order-section">
      <view class="section-header">
        <text class="section-title">我的订单</text>
        <view class="section-more" @click="goOrderList('')">
          <text>查看全部</text>
          <text class="iconfont chevron_right" style="font-size: 24rpx;"></text>
        </view>
      </view>
      <view class="order-tabs">
        <view class="order-tab" @click="goOrderList('pending')">
          <view class="tab-icon">
            <text class="iconfont account_balance_wallet" style="font-size: 40rpx;"></text>
          </view>
          <text class="tab-text">待付款</text>
        </view>
        <view class="order-tab" @click="goOrderList('paid')">
          <view class="tab-icon">
            <text class="iconfont inventory" style="font-size: 40rpx;"></text>
          </view>
          <text class="tab-text">待发货</text>
        </view>
        <view class="order-tab" @click="goOrderList('shipped')">
          <view class="tab-icon relative">
            <text class="iconfont local_shipping" style="font-size: 40rpx;"></text>
            <view class="tab-badge" v-if="orderCount.shipped > 0">{{ orderCount.shipped }}</view>
          </view>
          <text class="tab-text">待收货</text>
        </view>
        <view class="order-tab" @click="goOrderList('completed')">
          <view class="tab-icon">
            <text class="iconfont rate_review" style="font-size: 40rpx;"></text>
          </view>
          <text class="tab-text">待评价</text>
        </view>
        <view class="order-tab" @click="goOrderList('after-sale')">
          <view class="tab-icon">
            <text class="iconfont assignment_return" style="font-size: 40rpx;"></text>
          </view>
          <text class="tab-text">售后</text>
        </view>
      </view>
    </view>

    <!-- 常用工具 -->
    <view class="tools-section">
      <text class="section-title" style="margin-bottom: 20rpx;">常用工具</text>
      <view class="tools-grid">
        <view class="tool-card" @click="goAddress">
          <text class="iconfont location_on" style="color: #005da3; font-size: 44rpx;"></text>
          <text class="tool-name">地址管理</text>
        </view>
        <view class="tool-card" @click="callService">
          <text class="iconfont support_agent" style="color: #7c5800; font-size: 44rpx;"></text>
          <text class="tool-name">客服</text>
        </view>
        <view class="tool-card" @click="goSetting">
          <text class="iconfont settings" style="color: #bb0004; font-size: 44rpx;"></text>
          <text class="tool-name">设置</text>
        </view>
        <view class="tool-card" @click="goPrivacy">
          <text class="iconfont verified_user" style="color: #004880; font-size: 44rpx;"></text>
          <text class="tool-name">隐私</text>
        </view>
        <view class="tool-card" @click="goFavorite">
          <text class="iconfont favorite" style="color: #636e72; font-size: 44rpx;"></text>
          <text class="tool-name">收藏</text>
        </view>
        <view class="tool-card" @click="goHistory">
          <text class="iconfont history" style="color: #636e72; font-size: 44rpx;"></text>
          <text class="tool-name">浏览历史</text>
        </view>
        <view class="tool-card" @click="goInvite">
          <text class="iconfont share" style="color: #636e72; font-size: 44rpx;"></text>
          <text class="tool-name">邀请</text>
        </view>
        <view class="tool-card" @click="goHelp">
          <text class="iconfont help_outline" style="color: #636e72; font-size: 44rpx;"></text>
          <text class="tool-name">帮助</text>
        </view>
      </view>
    </view>

    <!-- 促销 Banner -->
    <view class="promo-banner">
      <view class="promo-overlay"></view>
      <image class="promo-bg" src="/static/promo-bg.png" mode="aspectFill" />
      <view class="promo-content">
        <text class="promo-tag">专属优惠</text>
        <text class="promo-title">今日升级PLUS会员享5折</text>
      </view>
      <view class="promo-btn">UPGRADE</view>
    </view>

    <view class="bottom-safe"></view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { checkLogin } from '@/utils/auth.js';
import request from '@/utils/request.js';

const statusBarHeight = ref(20);
const userInfo = ref(null);
const orderCount = reactive({ pending: 0, paid: 0, shipped: 0, completed: 0 });
const recommendList = ref([]);

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;
  await init();
});

onShow(async () => {
  if (checkLogin()) {
    userInfo.value = uni.getStorageSync('userInfo');
    await loadOrderCount();
  }
});

async function init() {
  userInfo.value = uni.getStorageSync('userInfo');
}

async function loadOrderCount() {
  try {
    const data = await request.get('/order/count');
    Object.assign(orderCount, data || {});
  } catch (e) {
    console.error('加载订单数量失败', e);
  }
}

function handleUserClick() {
  if (!checkLogin()) {
    uni.navigateTo({ url: '/pages/login/index' });
  }
}

function goOrderList(status) {
  if (!checkLogin()) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  uni.navigateTo({ url: `/pages/order/list?status=${status || ''}` });
}

function goAddress() {
  checkAuthAndNavigate('/pages/address/list');
}

function goFavorite() {
  checkAuthAndNavigate('/pages/favorite/index');
}

function goSetting() {
  checkAuthAndNavigate('/pages/setting/index');
}

function goPrivacy() {
  uni.navigateTo({ url: '/pages/privacy/index' });
}

function goHistory() {
  uni.navigateTo({ url: '/pages/history/index' });
}

function goInvite() {
  uni.navigateTo({ url: '/pages/invite/index' });
}

function goHelp() {
  uni.showModal({
    title: '帮助中心',
    content: '客服电话：400-888-8888',
    showCancel: true,
  });
}

function goAbout() {
  uni.showModal({
    title: '关于我们',
    content: '唯伊美妆 v1.0.0\n专注于美妆好物分享',
    showCancel: false,
  });
}

function callService() {
  uni.makePhoneCall({
    phoneNumber: '400-888-8888',
    fail: () => {
      uni.showToast({ title: '客服电话：400-888-8888', icon: 'none', duration: 3000 });
    },
  });
}

function checkAuthAndNavigate(url) {
  if (!checkLogin()) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  uni.navigateTo({ url });
}
</script>

<style lang="scss">
/* ============================================================
   我的（用户中心）— 参考 stitch_/_5 重构
   ============================================================ */

$primary: #bb0004;
$primary-container: #e1251b;
$on-primary: #ffffff;
$secondary: #7c5800;
$secondary-container: #feb700;
$secondary-fixed: #ffdea8;
$secondary-fixed-dim: #ffba20;
$tertiary: #005da3;
$surface: #fbf9f9;
$surface-lowest: #ffffff;
$surface-low: #f5f3f3;
$surface-high: #e9e8e7;
$surface-bright: #fbf9f9;
$surface-variant: #e3e2e2;
$on-surface: #1b1c1c;
$on-surface-variant: #5d3f3b;
$outline-variant: #e7bdb7;
$radius-sm: 4rpx;
$radius-md: 12rpx;
$radius-lg: 16rpx;
$radius-xl: 24rpx;
$radius-full: 9999rpx;

.page {
  min-height: 100vh;
  background: $surface;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

// ── 用户头部（渐变背景）──
.user-header {
  position: relative;
  padding: 48rpx 32rpx 0;
  overflow: hidden;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  min-height: 240rpx;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
}

.user-info {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255, 255, 255, 0.2);
  display: block;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.plus-badge {
  position: absolute;
  bottom: -8rpx;
  right: -8rpx;
  background: $secondary-container;
  color: $secondary;
  font-size: 18rpx;
  font-weight: 900;
  padding: 6rpx 16rpx;
  border-radius: $radius-full;
  font-family: 'Manrope', sans-serif;
  letter-spacing: 0.05em;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.user-name {
  font-family: 'Manrope', sans-serif;
  font-size: 44rpx;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.user-level {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  padding: 8rpx 20rpx;
  border-radius: $radius-full;
  width: fit-content;

  .level-text {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
  }
}

// 装饰光晕
.header-glow {
  position: absolute;
  top: -80rpx;
  right: -80rpx;
  width: 320rpx;
  height: 320rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  filter: blur(60rpx);
}

// ── 资产卡片（悬浮效果）──
.asset-card {
  margin: -40rpx 32rpx 0;
  background: $surface-lowest;
  border-radius: $radius-xl;
  box-shadow: 0 12rpx 32rpx rgba(27, 28, 28, 0.06);
  padding: 32rpx 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 20;
}

.asset-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;

  .asset-num {
    font-family: 'Manrope', sans-serif;
    font-size: 40rpx;
    font-weight: 800;
    color: $on-surface;
    letter-spacing: -0.02em;
  }

  .asset-label {
    font-size: 22rpx;
    font-weight: 600;
    color: $on-surface-variant;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
}

.asset-divider {
  width: 2rpx;
  height: 60rpx;
  background: $surface-low;
}

// ── 我的订单 ──
.order-section {
  margin: 28rpx 32rpx 0;
  background: $surface-lowest;
  border-radius: $radius-xl;
  padding: 32rpx 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;

  .section-title {
    font-family: 'Manrope', sans-serif;
    font-size: 32rpx;
    font-weight: 800;
    color: $on-surface;
    letter-spacing: -0.01em;
  }
}

.section-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: $on-surface-variant;
  font-weight: 500;

  &:active {
    opacity: 0.7;
  }
}

.order-tabs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8rpx;
}

.order-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;

  &:active {
    transform: scale(0.95);
  }
}

.tab-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: $surface-low;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .iconfont {
    color: $on-surface-variant;
  }
}

.tab-badge {
  position: absolute;
  top: -4rpx;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background: $primary;
  color: $on-primary;
  font-size: 20rpx;
  font-weight: 900;
  border-radius: 50%;
  border: 3rpx solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Manrope', sans-serif;
}

.tab-text {
  font-size: 20rpx;
  font-weight: 700;
  color: $on-surface-variant;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

// ── 常用工具 ──
.tools-section {
  margin: 24rpx 32rpx 0;
  background: $surface-lowest;
  border-radius: $radius-xl;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);

  .section-title {
    font-family: 'Manrope', sans-serif;
    font-size: 32rpx;
    font-weight: 800;
    color: $on-surface;
    letter-spacing: -0.01em;
    display: block;
  }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 16rpx;
  background: $surface-low;
  border-radius: $radius-xl;
  transition: background 0.15s ease;

  &:active {
    background: $surface-bright;
  }

  .tool-name {
    font-size: 22rpx;
    font-weight: 700;
    color: $on-surface-variant;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    text-align: center;
  }
}

// ── 促销 Banner ──
.promo-banner {
  position: relative;
  margin: 24rpx 32rpx;
  height: 200rpx;
  border-radius: $radius-xl;
  overflow: hidden;
  background: $on-surface;

  .promo-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 70%);
    z-index: 1;
  }

  .promo-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .promo-content {
    position: absolute;
    left: 32rpx;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    max-width: 70%;
  }

  .promo-tag {
    display: block;
    font-family: 'Manrope', sans-serif;
    font-size: 20rpx;
    font-weight: 900;
    color: $secondary-fixed-dim;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 8rpx;
  }

  .promo-title {
    font-family: 'Manrope', sans-serif;
    font-size: 32rpx;
    font-weight: 800;
    color: #fff;
    line-height: 1.3;
  }

  .promo-btn {
    position: absolute;
    right: 32rpx;
    bottom: 50%;
    transform: translateY(50%);
    z-index: 2;
    background: $secondary-container;
    color: $secondary;
    font-size: 22rpx;
    font-weight: 900;
    padding: 16rpx 32rpx;
    border-radius: $radius-full;
    letter-spacing: 0.05em;

    &:active {
      transform: translateY(50%) scale(0.95);
    }
  }
}

// ── 底部安全区 ──
.bottom-safe {
  height: calc(140rpx + env(safe-area-inset-bottom));
}
</style>