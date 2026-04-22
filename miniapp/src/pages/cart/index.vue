<template>
  <view class="page">
    <!-- 顶部导航 -->
    <header class="nav-header">
      <view class="nav-inner">
        <view class="nav-left">
          <text class="material-symbols-outlined nav-icon">location_on</text>
          <text class="nav-title">搜索商品</text>
        </view>
        <view class="nav-right">
          <text class="material-symbols-outlined nav-icon-sm">qr_code_scanner</text>
          <text class="nav-manage">管理</text>
        </view>
      </view>
    </header>

    <!-- 空购物车 -->
    <view class="empty-cart" v-if="cartList.length === 0 && !loading">
      <view class="empty-icon-wrap">
        <text class="material-symbols-outlined empty-icon">shopping_cart</text>
      </view>
      <text class="empty-text">购物车是空的</text>
      <view class="empty-btn" @click="goShopping">去逛逛</view>
    </view>

    <!-- 购物车列表 -->
    <view class="cart-content" v-else>
      <!-- 进度提示条 -->
      <view class="cart-tip-bar">
        <text class="tip-count">购物车 ({{ cartList.length }})</text>
        <view class="tip-badge">
          <text>满¥99免运费</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="cart-list">
        <view
          v-for="(item, index) in cartList"
          :key="item.id || `${item.product_id}-${item.sku_id}`"
          class="cart-item"
          :class="{ 'item-checked': item.is_checked }"
        >
          <!-- 圆形选择框 -->
          <view class="item-check" @click="toggleCheck(index)">
            <view class="check-circle" :class="{ checked: item.is_checked }">
              <text class="iconfont-check" v-if="item.is_checked">✓</text>
            </view>
          </view>

          <!-- 商品图片 -->
          <view class="item-img-wrap" @click="goDetail(item)">
            <image class="item-image" :src="item.cover_image" mode="aspectFill" />
          </view>

          <!-- 商品信息 -->
          <view class="item-info">
            <text class="item-title" @click="goDetail(item)">{{ item.title }}</text>
            <view class="item-sku-row" v-if="item.sku_name">
              <text class="item-sku">{{ item.sku_name }}</text>
              <text class="material-symbols-outlined sku-arrow">expand_more</text>
            </view>
            <view class="item-bottom">
              <view class="item-price-wrap">
                <text class="price-symbol">¥</text>
                <text class="price-int">{{ Math.floor(item.price) }}</text>
                <text class="price-dec">.{{ String((item.price % 1).toFixed(2)).slice(2) }}</text>
              </view>
              <!-- 数量步进器 -->
              <view class="qty-stepper">
                <view class="qty-btn qty-minus" @click.stop="decrease(index)">
                  <text class="qty-icon">−</text>
                </view>
                <text class="qty-num">{{ item.quantity }}</text>
                <view class="qty-btn qty-plus" @click.stop="increase(index)">
                  <text class="qty-icon">+</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 猜你喜欢 -->
      <view class="recommend-section">
        <view class="recommend-header">
          <view class="divider-line"></view>
          <view class="recommend-title">
            <text class="material-symbols-outlined heart-icon">favorite</text>
            <text>猜你喜欢</text>
          </view>
          <view class="divider-line"></view>
        </view>
        <view class="recommend-grid">
          <view class="recommend-item" v-for="item in recommendList" :key="item.id" @click="goDetail(item)">
            <view class="rec-img-wrap">
              <image class="rec-img" :src="item.cover_image" mode="aspectFill" />
            </view>
            <view class="rec-info">
              <text class="rec-title">{{ item.title }}</text>
              <view class="rec-bottom">
                <view class="rec-price-wrap">
                  <text class="price-symbol rec-symbol">¥</text>
                  <text class="rec-price">{{ item.price }}</text>
                </view>
                <view class="rec-add-btn">
                  <text class="material-symbols-outlined rec-cart-icon">add_shopping_cart</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder" v-if="cartList.length > 0"></view>

    <!-- 底部结算栏 -->
    <view class="cart-footer" v-if="cartList.length > 0">
      <view class="footer-left">
        <view class="select-all" @click="toggleAllCheck">
          <view class="check-circle" :class="{ checked: isAllChecked }">
            <text class="iconfont-check" v-if="isAllChecked">✓</text>
          </view>
          <text class="select-all-text">全选</text>
        </view>
        <view class="total-info">
          <text class="total-label">合计</text>
          <view class="total-price-wrap">
            <text class="price-symbol total-symbol">¥</text>
            <text class="total-price">{{ totalPrice }}</text>
          </view>
        </view>
      </view>
      <view class="footer-right">
        <view class="btn-settlement" @click="goSettlement">
          去结算
          <text class="settlement-count" v-if="checkedCount">({{ checkedCount }}件)</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import { useCartStore } from '@/stores/cart.js';

const cartStore = useCartStore();
const loading = ref(false);
const isEdit = ref(false);
const cartList = ref([]);
const recommendList = ref([]);

const isAllChecked = computed(() => {
  return cartList.value.length > 0 && cartList.value.every(item => item.is_checked);
});

const checkedCount = computed(() => {
  return cartList.value.filter(item => item.is_checked).reduce((sum, item) => sum + item.quantity, 0);
});

const totalPrice = computed(() => {
  return cartList.value
    .filter(item => item.is_checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);
});

onShow(async () => {
  await loadCartList();
  await loadRecommend();
});

async function loadCartList() {
  loading.value = true;
  try {
    const data = await request.get('/cart/list');
    cartList.value = (data || []).map(item => ({
      ...item,
      cover_image: request.fixImageUrl(item.cover_image)
    }));
    cartStore.setList(cartList.value);
  } catch (e) {
    console.error('加载购物车失败', e);
  } finally {
    loading.value = false;
  }
}

async function loadRecommend() {
  try {
    const res = await request.get('/product/recommend', { page: 1, pageSize: 4 });
    recommendList.value = (res?.list || []).map(p => ({
      ...p,
      cover_image: request.fixImageUrl(p.cover_image)
    }));
  } catch (e) {
    console.error('加载推荐失败', e);
  }
}

function toggleEdit() {
  isEdit.value = !isEdit.value;
}

function toggleCheck(index) {
  cartList.value[index].is_checked = !cartList.value[index].is_checked;
  syncCartCheck();
}

function toggleAllCheck() {
  const checked = !isAllChecked.value;
  cartList.value.forEach(item => {
    item.is_checked = checked;
  });
  syncCartCheck();
}

async function syncCartCheck() {
  try {
    const checkedItems = cartList.value.filter(item => item.is_checked);
    await request.put('/cart/checked', {
      ids: checkedItems.map(item => item.id),
      checked: 1,
    });
  } catch (e) {
    console.error('同步选中状态失败', e);
  }
}

function decrease(index) {
  if (cartList.value[index].quantity <= 1) return;
  updateQuantity(index, cartList.value[index].quantity - 1);
}

function increase(index) {
  updateQuantity(index, cartList.value[index].quantity + 1);
}

async function updateQuantity(index, quantity) {
  const item = cartList.value[index];
  try {
    await request.put(`/cart/${item.id}`, { quantity });
    cartList.value[index].quantity = quantity;
    cartStore.updateQuantity(index, quantity);
  } catch (e) {
    console.error('更新数量失败', e);
  }
}

async function removeItem(index) {
  const item = cartList.value[index];
  try {
    await request.delete(`/cart/${item.id}`);
    cartList.value.splice(index, 1);
    cartStore.removeItem(index);
  } catch (e) {
    console.error('删除失败', e);
  }
}

async function deleteChecked() {
  const checkedItems = cartList.value.filter(item => item.is_checked);
  if (checkedItems.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' });
    return;
  }
  try {
    await request.delete('/cart/batch', {
      ids: checkedItems.map(item => item.id),
    });
    cartList.value = cartList.value.filter(item => !item.is_checked);
    cartStore.clearChecked();
  } catch (e) {
    console.error('批量删除失败', e);
  }
}

function goShopping() {
  uni.switchTab({ url: '/pages/index/index' });
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.product_id}` });
}

function goSettlement() {
  const checkedItems = cartList.value.filter(item => item.is_checked);
  if (checkedItems.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' });
    return;
  }
  uni.setStorageSync('settlement_items', JSON.stringify(checkedItems));
  uni.navigateTo({ url: '/pages/order/confirm' });
}
</script>

<style lang="scss">
/* ================================================================
   购物车页面 - 参考 stitch_/_3 重构
   设计关键词: glass blur / 圆角卡片 / 圆形选择框 / 悬浮感 / 渐变按钮
   ================================================================ */

$primary: #bb0004;
$primary-container: #e1251b;
$on-primary: #ffffff;
$secondary-container: #feb700;
$surface: #fbf9f9;
$surface-lowest: #ffffff;
$surface-low: #f5f3f3;
$surface-high: #e9e8e7;
$surface-highest: #e3e2e2;
$surface-bright: #fbf9f9;
$surface-variant: #e3e2e2;
$surface-container: #efeded;
$surface-container-low: #f5f3f3;
$surface-container-lowest: #ffffff;
$surface-container-high: #e9e8e7;
$surface-container-highest: #e3e2e2;
$on-surface: #1b1c1c;
$on-surface-variant: #5d3f3b;
$outline-variant: #e7bdb7;
$radius-sm: 4rpx;
$radius-md: 12rpx;
$radius-lg: 16rpx;
$radius-xl: 24rpx;
$radius-full: 9999rpx;
$tabbar-height: 100rpx;

/* ── 页面容器 ── */
.page {
  min-height: 100vh;
  background: $surface;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: env(safe-area-inset-top);
}

/* ── 顶部导航 (参考设计: fixed glass header) ── */
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 128rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.05);
  padding-top: env(safe-area-inset-top);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 32rpx;
  max-width: 750rpx;
  margin: 0 auto;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nav-icon {
  font-size: 40rpx;
  color: $primary;
}

.nav-title {
  font-family: 'Manrope', sans-serif;
  font-size: 34rpx;
  font-weight: 800;
  color: $on-surface;
  letter-spacing: -0.01em;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.nav-icon-sm {
  font-size: 32rpx;
  color: $on-surface-variant;
}

.nav-manage {
  font-size: 26rpx;
  font-weight: 600;
  color: $on-surface-variant;
}

/* ── 空购物车 ── */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 280rpx;
}

.empty-icon-wrap {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: $surface-container-low;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  color: $on-surface-variant;
}

.empty-text {
  font-size: 28rpx;
  color: $on-surface-variant;
  margin-bottom: 56rpx;
}

.empty-btn {
  padding: 22rpx 72rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  border-radius: $radius-full;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 32rpx rgba($primary, 0.28);
  letter-spacing: 0.02em;
}

/* ── 购物车内容 ── */
.cart-content {
  padding: 148rpx 32rpx 0;
}

/* ── 提示条 ── */
.cart-tip-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $surface-container-low;
  border-radius: $radius-xl;
  padding: 24rpx 28rpx;
  margin-bottom: 24rpx;
}

.tip-count {
  font-family: 'Manrope', sans-serif;
  font-size: 30rpx;
  font-weight: 800;
  color: $primary;
}

.tip-badge {
  background: $surface-container-highest;
  font-size: 22rpx;
  color: $on-surface-variant;
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
  font-weight: 500;
}

/* ── 商品列表 ── */
.cart-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  padding: 28rpx;
  background: $surface-container-lowest;
  border-radius: $radius-xl;
  gap: 20rpx;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);

  &:active {
    background: $surface-bright;
  }

  &.item-checked {
    box-shadow: 0 4rpx 20rpx rgba($primary, 0.08);
  }
}

/* ── 圆形选择框 (纯 CSS) ── */
.item-check {
  flex-shrink: 0;
  padding-top: 56rpx;
}

.check-circle {
  width: 44rpx;
  height: 44rpx;
  border: 3rpx solid $outline-variant;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: transparent;
  position: relative;

  &.checked {
    background: $primary;
    border-color: $primary;
    box-shadow: 0 4rpx 12rpx rgba($primary, 0.3);

    .iconfont-check {
      color: $on-primary;
      display: block;
    }
  }
}

.iconfont-check {
  display: none;
  font-size: 24rpx;
  color: transparent;
  line-height: 1;
  font-weight: 700;
}

/* ── 商品图片 ── */
.item-img-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  background: $surface-container-low;
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  height: 100%;
}

/* ── 商品信息 ── */
.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 28rpx;
  color: $on-surface;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
  margin-bottom: 12rpx;
  letter-spacing: -0.01em;
}

.item-sku-row {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-bottom: 16rpx;
}

.item-sku {
  font-size: 22rpx;
  color: $on-surface-variant;
  background: $surface-container-high;
  padding: 6rpx 18rpx;
  border-radius: $radius-sm;
  font-weight: 500;
}

.sku-arrow {
  font-size: 22rpx;
  color: $on-surface-variant;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

/* ── 价格 ── */
.item-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.price-symbol {
  font-size: 20rpx;
  font-weight: 700;
  color: $primary;
  font-family: 'Manrope', sans-serif;
}

.price-int {
  font-size: 36rpx;
  font-weight: 800;
  color: $primary;
  font-family: 'Manrope', sans-serif;
  letter-spacing: -0.02em;
}

.price-dec {
  font-size: 20rpx;
  font-weight: 700;
  color: $primary;
}

/* ── 数量步进器 (圆形胶囊风格) ── */
.qty-stepper {
  display: flex;
  align-items: center;
  background: $surface-container-low;
  border-radius: $radius-full;
  padding: 4rpx;
  gap: 0;
}

.qty-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  .qty-icon {
    font-size: 30rpx;
    color: $on-surface-variant;
    font-weight: 600;
    line-height: 1;
    font-family: 'Manrope', sans-serif;
  }

  &:active {
    background: $surface-container-high;

    .qty-icon {
      color: $primary;
    }
  }

  &.qty-plus {
    background: $primary;

    .qty-icon {
      color: $on-primary;
    }

    &:active {
      background: $primary-container;
      opacity: 0.9;
    }
  }
}

.qty-num {
  min-width: 64rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  color: $on-surface;
  font-family: 'Manrope', sans-serif;
  padding: 0 8rpx;
}

/* ── 猜你喜欢 ── */
.recommend-section {
  margin-top: 64rpx;
  padding-bottom: 40rpx;
}

.recommend-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 36rpx;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: $outline-variant;
}

.recommend-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-family: 'Manrope', sans-serif;
  font-size: 32rpx;
  font-weight: 800;
  color: $on-surface;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.heart-icon {
  font-size: 32rpx;
  color: $primary;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.recommend-item {
  background: $surface-container-lowest;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.97);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  }
}

.rec-img-wrap {
  height: 280rpx;
  overflow: hidden;
  background: $surface-container-low;
}

.rec-img {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;

  &:active {
    transform: scale(1.05);
  }
}

.rec-info {
  padding: 20rpx 24rpx 24rpx;
}

.rec-title {
  font-size: 26rpx;
  color: $on-surface;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
  margin-bottom: 16rpx;
}

.rec-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rec-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.rec-symbol {
  font-size: 20rpx;
}

.rec-price {
  font-size: 30rpx;
  font-weight: 800;
  color: $primary;
  font-family: 'Manrope', sans-serif;
  letter-spacing: -0.02em;
}

.rec-add-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba($primary, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  .rec-cart-icon {
    font-size: 28rpx;
    color: $primary;
  }
}

/* ── 底部占位 ── */
.bottom-placeholder {
  height: calc(180rpx + 100rpx);
}

/* ── 底部结算栏 (玻璃模糊) ── */
.cart-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  z-index: 100;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 160rpx;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.select-all {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.select-all-text {
  font-size: 20rpx;
  font-weight: 700;
  color: $on-surface-variant;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.total-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-left: 8rpx;
}

.total-label {
  font-size: 22rpx;
  color: $on-surface-variant;
  font-weight: 500;
}

.total-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.total-symbol {
  font-size: 24rpx;
}

.total-price {
  font-family: 'Manrope', sans-serif;
  font-size: 40rpx;
  font-weight: 800;
  color: $primary;
  letter-spacing: -0.03em;
}

.footer-right {
  display: flex;
  align-items: center;
}

/* ── 结算按钮 (渐变 kinetic-gradient) ── */
.btn-settlement {
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  font-size: 30rpx;
  font-weight: 800;
  padding: 0 56rpx;
  height: 96rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba($primary, 0.3);
  letter-spacing: 0.02em;
  transition: all 0.2s ease;

  .settlement-count {
    font-size: 22rpx;
    font-weight: 500;
    opacity: 0.85;
    margin-left: 4rpx;
  }

  &:active {
    opacity: 0.88;
    transform: scale(0.96);
    box-shadow: 0 4rpx 16rpx rgba($primary, 0.25);
  }
}
</style>
