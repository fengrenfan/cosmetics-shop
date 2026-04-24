<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-inner">
        <!-- 定位 -->
        <view class="location">
          <text class="iconfont fa-location-dot" style="color: #bb0004; font-size: 32rpx;"></text>
          <text class="city-name">上海</text>
          <text class="iconfont fa-chevron-down" style="font-size: 20rpx; color: #5d3f3b;"></text>
        </view>
        <!-- 搜索栏 -->
        <view class="search-bar" @click="goSearch">
          <text class="iconfont fa-search" style="font-size: 32rpx;"></text>
          <text class="placeholder">搜索高端护肤品...</text>
          <text class="iconfont fa-camera" style="font-size: 36rpx;"></text>
        </view>
        <!-- 右侧图标 -->
        <view class="nav-icons">
          <view class="nav-icon-btn">
            <text class="iconfont fa-qrcode"></text>
          </view>
          <view class="nav-icon-btn relative">
            <text class="iconfont fa-bell"></text>
            <view class="red-dot"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 页面内容 -->
    <scroll-view
      class="content"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 轮播图 -->
      <view class="banner-section">
        <swiper
          class="banner-swiper"
          :indicator-dots="true"
          :autoplay="true"
          :interval="3000"
          :duration="500"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#fff"
        >
          <swiper-item v-for="(item, index) in banners" :key="index" @click="onBannerClick(item)">
            <view class="banner-item">
              <image class="banner-image" :src="item.image" mode="aspectFill" />
              <view class="banner-overlay" v-if="item.tag || item.title">
                <view class="banner-tag" v-if="item.tag">{{ item.tag }}</view>
                <view class="banner-title">{{ item.title || '' }}</view>
                <view class="banner-subtitle" v-if="item.subtitle">{{ item.subtitle }}</view>
                <view class="banner-btn">立即抢购</view>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 分类图标网格 - 10个带颜色背景的图标 -->
      <view class="category-grid">
        <view class="grid-item" v-for="(item, idx) in categoryIcons" :key="idx" @click="onGridIconClick(item)">
          <view class="grid-icon-bg" :style="{ background: item.bgColor }">
            <text class="iconfont" :class="item.icon" :style="{ color: item.iconColor }"></text>
          </view>
          <text class="grid-name">{{ item.name }}</text>
        </view>
      </view>

      <!-- 热销TOP10横向滚动 -->
      <view class="section" v-if="hotProducts.length > 0">
        <view class="section-header">
          <view class="section-accent-bar"></view>
          <text class="section-title">热销TOP10</text>
          <view class="section-more" @click="goHotList">
            <text>查看榜单</text>
            <text class="iconfont fa-chevron-right" style="font-size: 22rpx;"></text>
          </view>
        </view>
        <scroll-view scroll-x class="product-scroll">
          <view class="product-card" v-for="(item, idx) in hotProducts" :key="item.id" @click="goDetail(item)">
            <view class="product-img-wrap">
              <view class="rank-badge" :class="{ 'rank-dark': idx >= 3 }">{{ String(idx + 1).padStart(2, '0') }}</view>
              <image class="product-image" :src="item.cover_image" mode="aspectFill" />
            </view>
            <view class="product-card-body">
              <text class="product-title">{{ item.title }}</text>
              <text class="product-price">¥{{ item.price }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 为你推荐 -->
      <view class="section">
        <view class="section-header">
          <view class="section-accent-bar"></view>
          <text class="section-title">为你推荐</text>
        </view>
        <view class="product-grid">
          <view class="product-item" v-for="item in recommendProducts" :key="item.id" @click="goDetail(item)">
            <view class="product-img-wrap">
              <image class="product-image" :src="item.cover_image" mode="aspectFill" />
              <view class="product-tag" v-if="item.tag">{{ item.tag }}</view>
            </view>
            <view class="product-info">
              <text class="product-title">{{ item.title }}</text>
              <view class="product-bottom">
                <text class="product-price">¥{{ item.price }}</text>
                <view class="add-btn" @click.stop="addToCart(item)">
                  <text class="iconfont fa-cart-plus add-cart-icon"></text>
                </view>
              </view>
              <text class="product-sales">{{ item.rating || '5.0' }} ★ 已售 {{ item.sales_count || '0' }}</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more" v-if="recommendProducts.length > 0">
          <text v-if="loading">加载中...</text>
          <text v-else-if="noMore">没有更多了</text>
          <text v-else @click="loadMore">加载更多</text>
        </view>
      </view>

      <view class="bottom-safe"></view>
    </scroll-view>

    <!-- SKU 选择弹窗 -->
    <SkuSelectModal
      :show="showSkuModal"
      :product="currentProduct"
      actionType="cart"
      @close="showSkuModal = false"
      @confirm="onSkuConfirm"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { login } from '@/utils/auth.js';
import request from '@/utils/request.js';
import { useCartStore } from '@/stores/cart.js';
import SkuSelectModal from '@/components/SkuSelectModal.vue';
const cartStore = useCartStore();

const statusBarHeight = ref(20);
const refreshing = ref(false);
const loading = ref(false);
const noMore = ref(false);
const showSkuModal = ref(false);
const currentProduct = ref(null);

// 固定分类图标（Font Awesome 6 Free 图标）
const categoryIcons = [
  { name: '每日特惠', icon: 'fa-tag', bgColor: '#FFE8E8', iconColor: '#E1251B' },
  { name: '热销榜单', icon: 'fa-fire', bgColor: '#FFF4E0', iconColor: '#FF9500' },
  { name: '新人专享', icon: 'fa-crown', bgColor: '#E8F3FF', iconColor: '#007AFF' },
  { name: '积分商城', icon: 'fa-coins', bgColor: '#FFF0E5', iconColor: '#FF6B00' },
  { name: '会员中心', icon: 'fa-id-card', bgColor: '#F5EBFF', iconColor: '#985EFF' },
  { name: '全球直邮', icon: 'fa-globe', bgColor: '#E6F8FF', iconColor: '#00B2FF' },
  { name: '肤质测试', icon: 'fa-face-smile', bgColor: '#FFEDF3', iconColor: '#FF2D78' },
  { name: '有机系列', icon: 'fa-leaf', bgColor: '#ECF9F0', iconColor: '#34C759' },
  { name: '超值套装', icon: 'fa-box-open', bgColor: '#FFF6E5', iconColor: '#FFCC00' },
  { name: '专家咨询', icon: 'fa-headset', bgColor: '#F0F2F5', iconColor: '#636E72' },
];

// 数据
const banners = ref([]);
const categories = ref([]);
const featured = ref(null);
const hotProducts = ref([]);
const recommendProducts = ref([]);
const quickEntries = ref([]);

// 分页
const page = ref(1);
const pageSize = 10;

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;

  try {
    await login();
  } catch (e) {
    console.log('登录失败，将以游客模式访问');
  }

  await Promise.all([loadHomeData()]);
});

async function loadHomeData() {
  try {
    const [bannerRes, categoryRes, featuredRes, hotRes, recommendRes] = await Promise.all([
      request.get('/banner/list'),
      request.get('/category/tree'),
      request.get('/product/featured'),
      request.get('/product-recommend/hot'),
      request.get('/product/recommend'),
    ]);

    banners.value = (bannerRes || []).map(b => ({ ...b, image: request.fixImageUrl(b.image) }));
    categories.value = categoryRes || [];
    featured.value = featuredRes ? request.normalizeProduct(featuredRes) : null;
    hotProducts.value = (hotRes || []).map(p => request.normalizeProduct(p));
    recommendProducts.value = (recommendRes?.list || []).map(p => request.normalizeProduct(p));
    noMore.value = true; // 推荐列表为后台配置，不支持分页
  } catch (e) {
    console.error('加载首页数据失败', e);
  }
}

async function onRefresh() {
  refreshing.value = true;
  page.value = 1;
  noMore.value = false;
  await loadHomeData();
  refreshing.value = false;
}

async function loadMore() {
  if (noMore.value || loading.value) return;

  loading.value = true;
  page.value++;

  try {
    const res = await request.get('/product/recommend', { page: page.value, pageSize });
    if (res?.list?.length > 0) {
      recommendProducts.value = [...recommendProducts.value, ...res.list.map(p => request.normalizeProduct(p))];
    } else {
      noMore.value = true;
    }
  } catch (e) {
    page.value--;
  } finally {
    loading.value = false;
  }
}

function goSearch() {
  uni.navigateTo({ url: '/pages/product/list' });
}

function goCategory(category) {
  uni.switchTab({ url: '/pages/category/index' });
}

function goHotList() {
  uni.navigateTo({ url: '/pages/product/list?rank=hot' });
}

function onGridIconClick(item) {
  uni.switchTab({ url: '/pages/category/index' });
}

function goDetail(product) {
  uni.navigateTo({ url: `/pages/product/detail?id=${product.id}` });
}

async function addToCart(item) {
  // 有规格的商品弹出规格选择弹窗
  if (item.skus?.length > 0) {
    currentProduct.value = item;
    showSkuModal.value = true;
    return;
  }

  // 如果没有 sku 字段，先调用详情接口检查是否有规格
  if (!item.skus) {
    try {
      const detail = await request.get(`/product/${item.id}`);
      if (detail.skus?.length > 0) {
        currentProduct.value = { ...item, skus: detail.skus, price: detail.price };
        showSkuModal.value = true;
        return;
      }
    } catch (e) {
      console.error('获取商品详情失败', e);
    }
  }

  // 无规格直接加入购物车
  await cartStore.addItem({
    product_id: item.id,
    sku_id: null,
    title: item.title,
    cover_image: item.cover_image,
    price: item.price,
    quantity: 1,
    stock: item.stock,
  });
}

async function onSkuConfirm({ sku_id, quantity }) {
  const product = currentProduct.value;
  const sku = product.skus?.find(s => s.id === sku_id);
  await cartStore.addItem({
    product_id: product.id,
    sku_id: sku_id,
    title: product.title,
    cover_image: product.cover_image,
    price: sku?.price || product.price,
    quantity: quantity,
    stock: product.stock,
  });
  showSkuModal.value = false;
}

function onBannerClick(item) {
  if (item.link_type === 'product' && item.link_id) {
    uni.navigateTo({ url: `/pages/product/detail?id=${item.link_id}` });
  } else if (item.link_type === 'category' && item.link_id) {
    uni.navigateTo({ url: `/pages/product/list?category_id=${item.link_id}` });
  }
}
</script>

<style lang="scss">
/* ============================================================
   首页 — 参考 stitch_/_1 重构（精确匹配）
   ============================================================ */

$primary: #bb0004;
$primary-container: #e1251b;
$on-primary: #ffffff;
$secondary: #7c5800;
$secondary-container: #feb700;
$surface: #fbf9f9;
$surface-lowest: #ffffff;
$surface-low: #f5f3f3;
$surface-high: #e9e8e7;
$surface-variant: #e3e2e2;
$on-surface: #1b1c1c;
$on-surface-variant: #5d3f3b;
$outline-variant: #e7bdb7;
$radius-sm: 4rpx;
$radius-lg: 16rpx;
$radius-xl: 24rpx;
$radius-full: 9999rpx;

.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $surface;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
}

// ── 导航栏（精确匹配 HTML 结构）──
.nav-bar {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  padding: 0 24rpx;
  flex-shrink: 0;
  box-sizing: border-box;
}

.nav-inner {
  display: flex;
  align-items: center;
  height: 96rpx;
  gap: 16rpx;
}

// 定位
.location {
  display: flex;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;

  .city-name {
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 28rpx;
    color: $on-surface;
  }
}

// 搜索栏
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  height: 60rpx;
  background: $surface-high;
  border-radius: $radius-full;
  padding: 0 24rpx;
  gap: 12rpx;
  transition: all 0.2s;

  .iconfont {
    color: $on-surface-variant;
    font-size: 32rpx;
    flex-shrink: 0;
  }

  .placeholder {
    flex: 1;
    font-size: 26rpx;
    color: $on-surface-variant;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 右侧图标
.nav-icons {
  display: flex;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;
}

.nav-icon-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }

  .iconfont {
    font-size: 40rpx;
    color: $on-surface;
  }
}

.red-dot {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 12rpx;
  height: 12rpx;
  background: $primary;
  border-radius: 50%;
  border: 2rpx solid #fff;
}

// ── 内容区域 ──
.content {
  flex: 1;
  padding: 0;
}

// ── 轮播图 ──
.banner-section {
  padding: 24rpx 32rpx 0;
}

.banner-swiper {
  height: 340rpx;
  border-radius: $radius-xl;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.banner-tag {
  background: rgba($primary, 0.9);
  backdrop-filter: blur(8px);
  color: $on-primary;
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 16rpx;
  border-radius: $radius-full;
  width: fit-content;
  margin-bottom: 12rpx;
}

.banner-title {
  font-family: 'Manrope', sans-serif;
  font-size: 44rpx;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8rpx;
  letter-spacing: -0.02em;
}

.banner-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
  margin-bottom: 20rpx;
}

.banner-btn {
  background: #fff;
  color: $primary;
  font-size: 24rpx;
  font-weight: 700;
  padding: 12rpx 32rpx;
  border-radius: $radius-full;
  width: fit-content;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
}

// ── 分类图标网格（精确匹配 HTML 配色）──
.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx 8rpx;
  padding: 32rpx;
  margin: 24rpx 32rpx 0;
  background: $surface-lowest;
  border-radius: $radius-xl;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.9);
  }
}

.grid-icon-bg {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;

  .iconfont {
    font-size: 44rpx;
  }
}

.grid-name {
  font-size: 22rpx;
  color: $on-surface;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

// ── Section ──
.section {
  margin: 36rpx 32rpx;

  .section-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  .section-accent-bar {
    width: 6rpx;
    height: 44rpx;
    background: $primary;
    border-radius: 3rpx;
    flex-shrink: 0;
  }

  .section-title {
    font-family: 'Manrope', sans-serif;
    font-size: 34rpx;
    font-weight: 800;
    color: $on-surface;
    letter-spacing: -0.02em;
    flex: 1;
  }

  .section-more {
    display: flex;
    align-items: center;
    gap: 4rpx;
    font-size: 22rpx;
    color: $primary;
    font-weight: 700;

    &:active {
      opacity: 0.7;
    }
  }
}

// ── 热销横向滚动 ──
.product-scroll {
  white-space: nowrap;
}

.product-card {
  display: inline-flex;
  flex-direction: column;
  width: 260rpx;
  margin-right: 20rpx;
  background: $surface-lowest;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba($outline-variant, 0.2);
  vertical-align: top;

  &:active {
    opacity: 0.95;
    transform: scale(0.97);
  }
}

.product-img-wrap {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: $surface-low;

  .product-image {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
  }

  &:hover .product-image {
    transform: scale(1.05);
  }
}

.rank-badge {
  position: absolute;
  top: 0;
  left: 0;
  width: 56rpx;
  height: 56rpx;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-right-radius: $radius-lg;
  z-index: 1;
  font-family: 'Manrope', sans-serif;

  &.rank-dark {
    background: #636e72;
  }
}

.product-card-body {
  padding: 16rpx;

  .product-title {
    font-size: 24rpx;
    color: $on-surface;
    font-weight: 500;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    margin-bottom: 10rpx;
    height: 68rpx;
  }

  .product-price {
    font-size: 28rpx;
    color: $primary;
    font-weight: 800;
    font-family: 'Manrope', sans-serif;
    letter-spacing: -0.01em;
  }
}

// ── 推荐商品网格 ──
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.product-item {
  background: $surface-lowest;
  border-radius: $radius-xl;
  overflow: hidden;
  border: 1rpx solid rgba($outline-variant, 0.1);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

  &:active {
    transform: scale(0.97);
  }
}

.product-img-wrap {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: $surface-low;

  .product-image {
    width: 100%;
    height: 100%;
  }
}

.product-tag {
  position: absolute;
  bottom: 12rpx;
  left: 12rpx;
  background: #fab700;
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
}

.product-info {
  padding: 20rpx;
}

.product-title {
  font-size: 26rpx;
  color: $on-surface;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rpx;
}

.product-price {
  font-size: 32rpx;
  color: $primary;
  font-weight: 900;
  font-family: 'Manrope', sans-serif;
  letter-spacing: -0.02em;
}

.add-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: $primary;
  color: $on-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba($primary, 0.3);

  &:active {
    transform: scale(0.9);
  }

  .add-cart-icon {
    font-size: 32rpx;
    color: #fff;
  }
}

.product-sales {
  font-size: 20rpx;
  color: $on-surface-variant;
}

// ── 加载更多 ──
.load-more {
  text-align: center;
  padding: 40rpx 0;
  color: $on-surface-variant;
  font-size: 26rpx;
}

// ── 底部安全区 ──
.bottom-safe {
  height: calc(140rpx + env(safe-area-inset-bottom));
}
</style>