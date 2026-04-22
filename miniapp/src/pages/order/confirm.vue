<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="top-bar-inner">
        <view class="back-btn" @click="goBack">
          <text class="iconfont arrow_back" style="font-size: 36rpx; color: #636e72;"></text>
        </view>
        <text class="page-title">确认订单</text>
        <view class="more-btn">
          <text class="iconfont more_horiz" style="font-size: 36rpx; color: #636e72;"></text>
        </view>
      </view>
      <view class="top-divider"></view>
    </view>

    <scroll-view class="main-content" scroll-y>
      <!-- 收货地址 -->
      <view class="address-section" @click="goAddressList">
        <view class="address-content" v-if="selectedAddress">
          <view class="address-icon-wrap">
            <text class="iconfont location_on" style="font-size: 36rpx; color: #bb0004;"></text>
          </view>
          <view class="address-info">
            <view class="address-user">
              <view class="address-default-tag" v-if="selectedAddress.is_default">默认</view>
              <text class="address-name">{{ selectedAddress.name }}</text>
              <text class="address-phone">{{ selectedAddress.phone }}</text>
            </view>
            <view class="address-detail">
              {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail_address }}
            </view>
          </view>
          <text class="iconfont chevron_right" style="font-size: 32rpx; color: #926f69; flex-shrink: 0;"></text>
          <view class="address-stripe"></view>
        </view>
        <view class="address-empty" v-else>
          <text class="iconfont location_on" style="font-size: 40rpx; color: #5d3f3b;"></text>
          <text style="font-size: 28rpx; color: #5d3f3b;">请添加收货地址</text>
          <text class="iconfont chevron_right" style="font-size: 32rpx; color: #926f69;"></text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="goods-section">
        <view class="shop-header">
          <text class="iconfont storefront" style="font-size: 32rpx; color: #bb0004;"></text>
          <text class="shop-name">极致美妆旗舰店</text>
        </view>
        <view class="goods-list">
          <view class="goods-item" v-for="(item, index) in settlementItems" :key="index">
            <view class="goods-img-wrap">
              <image class="goods-image" :src="item.cover_image" mode="aspectFill" />
            </view>
            <view class="goods-info">
              <text class="goods-title">{{ item.title }}</text>
              <text class="goods-sku" v-if="item.sku_name">规格: {{ item.sku_name }}</text>
              <view class="goods-bottom">
                <view class="goods-price-wrap">
                  <text class="price-symbol" style="font-size: 22rpx;">¥</text>
                  <text class="goods-price">{{ item.price }}</text>
                </view>
                <text class="goods-count">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="payment-section">
        <text class="section-title">支付方式</text>
        <view class="payment-list">
          <view class="payment-item" :class="{ active: payMethod === 'wechat' }" @click="payMethod = 'wechat'">
            <view class="payment-icon" style="color: #07C160;">
              <text class="iconfont account_balance_wallet" style="font-size: 40rpx;"></text>
            </view>
            <text class="payment-name">微信支付</text>
            <view class="payment-check" v-if="payMethod === 'wechat'">
              <text class="iconfont check" style="font-size: 24rpx; color: #bb0004;"></text>
            </view>
          </view>
          <view class="payment-item" :class="{ active: payMethod === 'alipay' }" @click="payMethod = 'alipay'">
            <view class="payment-icon" style="color: #1677FF;">
              <text class="iconfont payments" style="font-size: 40rpx;"></text>
            </view>
            <text class="payment-name">支付宝支付</text>
            <view class="payment-check" v-if="payMethod === 'alipay'">
              <text class="iconfont check" style="font-size: 24rpx; color: #bb0004;"></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单摘要 -->
      <view class="summary-section">
        <view class="summary-row">
          <text class="summary-label">商品总额</text>
          <text class="summary-value">¥{{ totalPrice }}</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">运费</text>
          <text class="summary-value">{{ freight > 0 ? '¥' + freight : '¥0.00' }}</text>
        </view>
        <view class="summary-row" v-if="shopDiscount > 0">
          <text class="summary-label">店铺优惠</text>
          <text class="summary-discount">- ¥{{ shopDiscount.toFixed(2) }}</text>
        </view>
        <view class="summary-total-row">
          <text class="summary-tip">共{{ totalCount }}件商品，合计:</text>
          <view class="total-price-wrap">
            <text class="price-symbol" style="font-size: 24rpx;">¥</text>
            <text class="total-price">{{ actualPrice }}</text>
          </view>
        </view>
      </view>

      <!-- 积分提示 -->
      <view class="points-section">
        <view class="points-left">
          <text class="iconfont stars" style="font-size: 36rpx; color: #7c5800;"></text>
          <view class="points-text">
            <text class="points-label">可用积分</text>
            <text class="points-desc">本次订单可获得 {{ Math.floor(actualPrice) }} 积分</text>
          </view>
        </view>
        <text class="iconfont help_outline" style="font-size: 32rpx; color: #7c5800;"></text>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部结算栏 -->
    <view class="bottom-bar">
      <view class="total-info">
        <text class="total-label">应付总额</text>
        <view class="total-price-wrap">
          <text class="price-symbol" style="font-size: 24rpx; color: #bb0004;">¥</text>
          <text class="total-price">{{ actualPrice }}</text>
        </view>
      </view>
      <view class="btn-submit" @click="handleSubmit" :class="{ disabled: !canSubmit }">
        提交订单
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import request from '@/utils/request.js';

const statusBarHeight = ref(20);
const settlementItems = ref([]);
const selectedAddress = ref(null);
const payMethod = ref('wechat');
const remark = ref('');
const submitting = ref(false);

const totalPrice = computed(() => {
  return settlementItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
});

const freight = computed(() => {
  return parseFloat(totalPrice.value) >= 99 ? 0 : 10;
});

const shopDiscount = computed(() => {
  return parseFloat(totalPrice.value) * 0.05;
});

const totalCount = computed(() => {
  return settlementItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

const actualPrice = computed(() => {
  return (parseFloat(totalPrice.value) + freight.value - shopDiscount.value).toFixed(2);
});

const canSubmit = computed(() => {
  return selectedAddress.value && settlementItems.value.length > 0 && !submitting.value;
});

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;
  loadData();
});

async function loadData() {
  const items = uni.getStorageSync('settlement_items');
  if (items) {
    settlementItems.value = JSON.parse(items);
  }

  try {
    const res = await request.get('/address/list');
    const list = res || [];
    selectedAddress.value = list.find(a => a.is_default) || list[0] || null;
  } catch (e) {
    console.error('加载地址失败', e);
  }
}

function goBack() {
  uni.navigateBack();
}

function goAddressList() {
  uni.navigateTo({ url: '/pages/address/list?from=confirm' });
}

async function handleSubmit() {
  if (!canSubmit.value) return;

  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' });
    return;
  }

  submitting.value = true;

  try {
    const items = settlementItems.value.map(item => ({
      product_id: item.product_id,
      sku_id: item.sku_id,
      quantity: item.quantity,
      cart_id: item.id
    }));

    const res = await request.post('/order/create', {
      address_id: selectedAddress.value.id,
      items,
      remark: remark.value,
    });

    uni.redirectTo({
      url: `/pages/order/detail?id=${res.id}&order_no=${res.order_no}&pay_amount=${res.pay_amount}`
    });
  } catch (e) {
    console.error('提交订单失败', e);
    uni.showToast({ title: '提交失败，请重试', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss">
/* ============================================================
   确认订单页 — 参考 stitch_/_4 重构
   ============================================================ */

$primary: #bb0004;
$primary-container: #e1251b;
$on-primary: #ffffff;
$secondary: #7c5800;
$secondary-container: #feb700;
$secondary-fixed: #ffdea8;
$tertiary: #005da3;
$surface: #fbf9f9;
$surface-lowest: #ffffff;
$surface-low: #f5f3f3;
$surface-high: #e9e8e7;
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
  display: flex;
  flex-direction: column;
}

// ── 顶部导航栏 ──
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.top-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 16rpx;
}

.back-btn,
.more-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
}

.page-title {
  font-family: 'Manrope', sans-serif;
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
  letter-spacing: -0.01em;
}

.top-divider {
  height: 2rpx;
  background: $surface-high;
}

// ── 主内容 ──
.main-content {
  flex: 1;
  padding-top: calc(90rpx + env(safe-area-inset-top));
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

// ── 收货地址 ──
.address-section {
  margin: 24rpx 32rpx;
  background: $surface-lowest;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
}

.address-content {
  display: flex;
  align-items: flex-start;
  padding: 32rpx;
  gap: 16rpx;
  position: relative;
}

.address-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-md;
  background: rgba($primary, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.address-info {
  flex: 1;
}

.address-user {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.address-default-tag {
  background: rgba($primary, 0.1);
  color: $primary;
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: $radius-full;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.address-name {
  font-family: 'Manrope', sans-serif;
  font-size: 32rpx;
  font-weight: 800;
  color: $on-surface;
}

.address-phone {
  font-size: 26rpx;
  color: $on-surface-variant;
}

.address-detail {
  font-size: 26rpx;
  color: $on-surface-variant;
  line-height: 1.5;
}

// 地址装饰条纹
.address-stripe {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: repeating-linear-gradient(
    -45deg,
    $primary,
    $primary 10rpx,
    $surface-lowest 10rpx,
    $surface-lowest 20rpx,
    $tertiary 20rpx,
    $tertiary 30rpx,
    $surface-lowest 30rpx,
    $surface-lowest 40rpx
  );
}

.address-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 48rpx;
}

// ── 商品列表 ──
.goods-section {
  margin: 0 32rpx 20rpx;
  background: $surface-lowest;
  border-radius: $radius-xl;
  padding: 24rpx;
}

.shop-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;

  .shop-name {
    font-family: 'Manrope', sans-serif;
    font-size: 26rpx;
    font-weight: 700;
    color: $on-surface;
  }
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.goods-item {
  display: flex;
  gap: 20rpx;
}

.goods-img-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  background: $surface-low;
  flex-shrink: 0;

  .goods-image {
    width: 100%;
    height: 100%;
  }
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rpx 0;
}

.goods-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $on-surface;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.goods-sku {
  font-size: 22rpx;
  color: $on-surface-variant;
  background: $surface-low;
  padding: 4rpx 16rpx;
  border-radius: $radius-sm;
  display: inline-block;
  margin-top: 8rpx;
  width: fit-content;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.goods-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2rpx;

  .price-symbol {
    font-weight: 700;
    color: $primary;
  }

  .goods-price {
    font-family: 'Manrope', sans-serif;
    font-size: 36rpx;
    font-weight: 800;
    color: $primary;
    letter-spacing: -0.02em;
  }
}

.goods-count {
  font-size: 26rpx;
  color: $on-surface-variant;
  font-weight: 500;
}

// ── 支付方式 ──
.payment-section {
  margin: 0 32rpx 20rpx;
  background: $surface-lowest;
  border-radius: $radius-xl;
  padding: 24rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $on-surface;
  margin-bottom: 20rpx;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-radius: $radius-lg;
  gap: 16rpx;
  transition: background 0.15s ease;

  &:active {
    background: $surface-low;
  }

  &.active {
    background: rgba($primary, 0.03);
  }
}

.payment-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-name {
  flex: 1;
  font-size: 28rpx;
  color: $on-surface;
  font-weight: 500;
}

.payment-check {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

// ── 订单摘要 ──
.summary-section {
  margin: 0 32rpx 20rpx;
  background: $surface-lowest;
  border-radius: $radius-xl;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: $on-surface-variant;
}

.summary-value {
  color: $on-surface;
  font-weight: 500;
}

.summary-discount {
  color: $primary;
  font-weight: 700;
}

.summary-total-row {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 12rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $surface-high;

  .summary-tip {
    font-size: 22rpx;
    color: $on-surface-variant;
  }

  .total-price-wrap {
    display: flex;
    align-items: baseline;
    gap: 2rpx;

    .total-price {
      font-family: 'Manrope', sans-serif;
      font-size: 40rpx;
      font-weight: 800;
      color: $primary;
      letter-spacing: -0.02em;
    }
  }
}

// ── 积分提示 ──
.points-section {
  margin: 0 32rpx 20rpx;
  background: $secondary-fixed;
  border-radius: $radius-xl;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.points-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.points-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.points-label {
  font-size: 22rpx;
  font-weight: 700;
  color: $secondary;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.points-desc {
  font-size: 20rpx;
  color: rgba($secondary, 0.7);
}

// ── 底部占位 ──
.bottom-placeholder {
  height: 160rpx;
}

// ── 底部结算栏 ──
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 -8rpx 30rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.total-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;

  .total-label {
    font-size: 20rpx;
    font-weight: 700;
    color: $on-surface-variant;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .total-price-wrap {
    display: flex;
    align-items: baseline;
    gap: 2rpx;

    .total-price {
      font-family: 'Manrope', sans-serif;
      font-size: 48rpx;
      font-weight: 800;
      color: $primary;
      letter-spacing: -0.02em;
    }
  }
}

.btn-submit {
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  font-family: 'Manrope', sans-serif;
  font-size: 30rpx;
  font-weight: 800;
  padding: 0 56rpx;
  height: 88rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba($primary, 0.2);

  &:active {
    transform: scale(0.95);
  }

  &.disabled {
    background: #ccc;
    box-shadow: none;
  }
}
</style>