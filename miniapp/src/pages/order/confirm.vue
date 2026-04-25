<template>
  <view class="page">
    <scroll-view class="main-content" scroll-y>
      <!-- 收货地址 -->
      <view class="address-section" @click="goAddressList">
        <view class="address-content" v-if="selectedAddress">
          <text class="iconfont fa-location-dot" style="font-size: 40rpx; color: #bb0004; flex-shrink: 0;"></text>
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
          <text class="iconfont fa-chevron-right" style="font-size: 32rpx; color: #926f69; flex-shrink: 0;"></text>
          <view class="address-stripe"></view>
        </view>
        <view class="address-empty" v-else>
          <text class="iconfont fa-location-dot" style="font-size: 40rpx; color: #5d3f3b;"></text>
          <text style="font-size: 28rpx; color: #5d3f3b;">请添加收货地址</text>
          <text class="iconfont fa-chevron-right" style="font-size: 32rpx; color: #926f69;"></text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="goods-section">
        <view class="shop-header">
          <text class="iconfont fa-shop" style="font-size: 32rpx; color: #bb0004;"></text>
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
            <image class="payment-icon" src="/static/images/wechat_pay_icon.png" mode="aspectFit" />
            <text class="payment-name">微信支付</text>
            <view class="payment-check" :class="{ checked: payMethod === 'wechat' }">
              <text class="iconfont fa-check" style="font-size: 20rpx; color: #fff;"></text>
            </view>
          </view>
          <view class="payment-item" :class="{ active: payMethod === 'alipay' }" @click="payMethod = 'alipay'">
            <image class="payment-icon" src="/static/images/alipay_icon.png" mode="aspectFit" />
            <text class="payment-name">支付宝支付</text>
            <view class="payment-check" :class="{ checked: payMethod === 'alipay' }">
              <text class="iconfont fa-check" style="font-size: 20rpx; color: #fff;"></text>
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
        <view class="summary-row summary-row-clickable" @click="chooseCoupon">
          <text class="summary-label">优惠券</text>
          <view class="summary-row-right">
            <text class="summary-value">{{ selectedCouponTitle }}</text>
            <text class="iconfont fa-chevron-right" style="font-size: 24rpx; color: #926f69;"></text>
          </view>
        </view>
        <view class="summary-row" v-if="couponDiscount > 0">
          <text class="summary-label">优惠券抵扣</text>
          <text class="summary-discount">- ¥{{ couponDiscount.toFixed(2) }}</text>
        </view>
        <view class="summary-total-row">
          <text class="summary-tip">共{{ totalCount }}件商品，合计:</text>
          <view class="total-price-wrap">
            <text class="price-symbol" style="font-size: 24rpx;">¥</text>
            <text class="total-price">{{ actualPrice }}</text>
          </view>
        </view>
      </view>

      <!-- 积分抵扣 -->
      <view class="points-section" v-if="userPoints >= 500">
        <view class="points-left">
          <text class="iconfont fa-star" style="font-size: 36rpx; color: #7c5800;"></text>
          <view class="points-text">
            <text class="points-label">使用积分</text>
            <text class="points-desc">可用 {{ userPoints }} 积分（满500可用，100积分=1元）</text>
          </view>
        </view>
        <view class="points-input-wrap">
          <input
            class="points-input"
            type="number"
            :value="usePoints"
            :max="maxUsePoints"
            placeholder="0"
            @input="onPointsInput"
          />
          <text class="points-unit">积分</text>
        </view>
      </view>
      <view class="points-deduction" v-if="usePoints > 0">
        <text>可抵扣 ¥{{ pointsMoney.toFixed(2) }}</text>
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
import { onLoad } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import { checkLogin } from '@/utils/auth.js';

const settlementItems = ref([]);
const selectedAddress = ref(null);
const payMethod = ref('wechat');
const remark = ref('');
const submitting = ref(false);
const userPoints = ref(0);
const usePoints = ref(0);
const maxUsePoints = ref(0);
const pointsMoney = ref(0);
const availableCoupons = ref([]);
const selectedCouponId = ref(null);
const couponDiscount = ref(0);
const selectedCouponTitle = ref('不使用优惠券');

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
  const base = parseFloat(totalPrice.value) + freight.value - shopDiscount.value;
  const afterCoupon = base - couponDiscount.value;
  const afterPoints = afterCoupon - pointsMoney.value;
  return Math.max(0, afterPoints).toFixed(2);
});

const canSubmit = computed(() => {
  return selectedAddress.value && settlementItems.value.length > 0 && !submitting.value;
});

onMounted(() => {
  if (!checkLogin()) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  loadData();
});

onLoad(() => {
  uni.setNavigationBarTitle({ title: '确认订单' });
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

  // 加载用户积分
  loadPoints();
  await loadCoupons();
}

async function loadCoupons() {
  try {
    const userId = uni.getStorageSync('user_id');
    const res = await request.get('/coupon/my', { user_id: userId, status: 'unused' });
    const list = res || [];
    availableCoupons.value = list.filter((item) => Number(item?.coupon?.min_amount || 0) <= parseFloat(totalPrice.value));
  } catch (e) {
    console.error('获取优惠券失败', e);
    availableCoupons.value = [];
  }
}

async function loadPoints() {
  try {
    const res = await request.get('/points');
    userPoints.value = res.points || 0;
    await calculateMaxPoints();
  } catch (e) {
    console.error('获取积分失败', e);
  }
}

async function calculateMaxPoints() {
  try {
    const res = await request.post('/points/calculate', {
      total_amount: parseFloat(totalPrice.value) + freight.value,
    });
    maxUsePoints.value = res.maxPoints || 0;
  } catch (e) {
    console.error('计算积分失败', e);
  }
}

function onPointsInput(e) {
  let val = parseInt(e.detail.value) || 0;
  val = Math.floor(val / 100) * 100;
  val = Math.min(val, maxUsePoints.value);
  usePoints.value = val;
  pointsMoney.value = val / 100;
}

async function applySelectedCoupon(couponId) {
  if (!couponId) {
    couponDiscount.value = 0;
    return;
  }
  try {
    const res = await request.post('/coupon/apply', {
      coupon_id: couponId,
      order_amount: parseFloat(totalPrice.value),
    });
    couponDiscount.value = Number(res?.discountAmount || 0);
  } catch (e) {
    console.error('计算优惠券金额失败', e);
    couponDiscount.value = 0;
  }
}

function chooseCoupon() {
  const actions = ['不使用优惠券', ...availableCoupons.value.map((item) => item.coupon?.title || '优惠券')];
  uni.showActionSheet({
    itemList: actions,
    success: async ({ tapIndex }) => {
      if (tapIndex === 0) {
        selectedCouponId.value = null;
        selectedCouponTitle.value = '不使用优惠券';
        await applySelectedCoupon(null);
        return;
      }

      const coupon = availableCoupons.value[tapIndex - 1];
      selectedCouponId.value = coupon?.coupon?.id || coupon?.coupon_id || null;
      selectedCouponTitle.value = coupon?.coupon?.title || '已选择优惠券';
      await applySelectedCoupon(selectedCouponId.value);
    },
  });
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
      pay_channel: payMethod.value,
      pay_scene: process.env.UNI_PLATFORM === 'h5' ? 'h5' : 'miniapp',
      coupon_id: selectedCouponId.value || undefined,
      points_amount: usePoints.value,
      points_money: pointsMoney.value,
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
   确认订单页
   ============================================================ */

$primary: #bb0004;
$primary-container: #e1251b;
$on-primary: #ffffff;
$secondary: #7c5800;
$secondary-container: #feb700;
$secondary-fixed: #ffdea8;
$tertiary: #005da3;
$surface: #f5f3f3;
$surface-lowest: #ffffff;
$surface-low: #f5f3f3;
$surface-high: #e9e8e7;
$surface-variant: #e3e2e2;
$on-surface: #1b1c1c;
$on-surface-variant: #5d3f3b;
$outline-variant: #e7bdb7;
$radius-sm: 8rpx;
$radius-md: 16rpx;
$radius-lg: 24rpx;
$radius-xl: 32rpx;
$radius-full: 9999rpx;
$tabbar-height: 100rpx;

.page {
  min-height: 100vh;
  background: $surface;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  flex-direction: column;
}

// ── 主内容 ──
.main-content {
  flex: 1;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

// ── 收货地址 ──
.address-section {
  margin: 24rpx;
  background: $surface-lowest;
  border-radius: $radius-lg;
  overflow: hidden;
}

.address-content {
  display: flex;
  align-items: center;
  padding: 32rpx;
  gap: 20rpx;
  position: relative;
}

.address-info {
  flex: 1;
}

.address-user {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.address-default-tag {
  background: rgba($primary, 0.1);
  color: $primary;
  font-size: 20rpx;
  font-weight: 600;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
}

.address-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $on-surface;
}

.address-phone {
  font-size: 26rpx;
  color: $on-surface-variant;
}

.address-detail {
  font-size: 26rpx;
  color: $on-surface-variant;
  line-height: 1.4;
}

.address-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 48rpx;
  color: $on-surface-variant;
}

// ── 商品列表 ──
.goods-section {
  margin: 0 24rpx 24rpx;
  background: $surface-lowest;
  border-radius: $radius-lg;
  padding: 24rpx;
}

.shop-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;

  .shop-name {
    font-size: 26rpx;
    font-weight: 600;
    color: $on-surface;
  }
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.goods-item {
  display: flex;
  gap: 20rpx;
}

.goods-img-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-md;
  overflow: hidden;
  background: $surface-low;
  flex-shrink: 0;
}

.goods-image {
  width: 100%;
  height: 100%;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160rpx;
}

.goods-title {
  font-size: 28rpx;
  font-weight: 500;
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
  padding: 6rpx 16rpx;
  border-radius: $radius-sm;
  display: inline-block;
  margin-top: 8rpx;
  width: fit-content;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.goods-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 22rpx;
  font-weight: 600;
  color: $primary;
}

.goods-price {
  font-size: 32rpx;
  font-weight: 600;
  color: $primary;
}

.goods-count {
  font-size: 24rpx;
  color: $on-surface-variant;
}

// ── 支付方式 ──
.payment-section {
  margin: 0 24rpx 24rpx;
  background: $surface-lowest;
  border-radius: $radius-lg;
  padding: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $on-surface;
  margin-bottom: 20rpx;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-radius: $radius-md;
  gap: 16rpx;

  &.active {
    background: rgba($primary, 0.05);
    border: 2rpx solid rgba($primary, 0.2);
  }
}

.payment-icon {
  width: 48rpx;
  height: 48rpx;
}

.payment-name {
  flex: 1;
  font-size: 28rpx;
  color: $on-surface;
}

.payment-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid $outline-variant;
  display: flex;
  align-items: center;
  justify-content: center;

  &.checked {
    background: $primary;
    border-color: $primary;
  }
}

// ── 订单摘要 ──
.summary-section {
  margin: 0 24rpx 24rpx;
  background: $surface-lowest;
  border-radius: $radius-lg;
  padding: 24rpx;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: $on-surface-variant;
  padding: 12rpx 0;
}

.summary-row-clickable {
  align-items: center;
}

.summary-row-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.summary-value {
  color: $on-surface;
}

.summary-discount {
  color: $primary;
  font-weight: 500;
}

.summary-total-row {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 12rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $surface-low;
}

.summary-tip {
  font-size: 24rpx;
  color: $on-surface-variant;
}

.total-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.total-price {
  font-size: 36rpx;
  font-weight: 600;
  color: $primary;
}

// ── 积分提示 ──
.points-section {
  margin: 0 24rpx 24rpx;
  background: $secondary-fixed;
  border-radius: $radius-lg;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.points-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.points-label {
  font-size: 24rpx;
  font-weight: 600;
  color: $secondary;
}

.points-desc {
  font-size: 22rpx;
  color: rgba($secondary, 0.8);
}

.points-input-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.points-input {
  width: 140rpx;
  height: 56rpx;
  background: $surface-lowest;
  border-radius: $radius-sm;
  padding: 0 12rpx;
  font-size: 26rpx;
  text-align: right;
}

.points-unit {
  font-size: 24rpx;
  color: $secondary;
}

.points-deduction {
  margin: 0 24rpx 24rpx;
  background: $secondary-fixed;
  border-radius: $radius-lg;
  padding: 16rpx 24rpx;
  text-align: right;
  font-size: 26rpx;
  color: $secondary;
  font-weight: 600;
}

// ── 底部占位 ──
.bottom-placeholder {
  height: calc(140rpx + env(safe-area-inset-bottom));
}

// ── 底部结算栏 ──
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: $surface-lowest;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  border-top: 1rpx solid $surface-low;
}

.total-info {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 22rpx;
  color: $on-surface-variant;
}

.total-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.total-price {
  font-size: 44rpx;
  font-weight: 700;
  color: $primary;
}

.btn-submit {
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  font-size: 28rpx;
  font-weight: 600;
  padding: 0 48rpx;
  height: 80rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.9;
  }

  &.disabled {
    background: #ccc;
  }
}
</style>