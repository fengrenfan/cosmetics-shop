<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="top-bar-inner">
        <view class="location">
          <text class="iconfont location_on" style="color: #bb0004;"></text>
          <text class="page-title">搜索商品</text>
        </view>
        <view class="top-icons">
          <view class="icon-btn">
            <text class="iconfont qr_code_scanner"></text>
          </view>
        </view>
      </view>
      <!-- 移动端搜索栏 -->
      <view class="search-input-wrap">
        <text class="iconfont search" style="font-size: 32rpx;"></text>
        <input class="search-input" placeholder="搜索品牌或商品" disabled @click="goSearch" />
      </view>
    </view>

    <!-- 分类内容 -->
    <view class="category-content">
      <!-- 左侧分类 -->
      <scroll-view class="category-left" scroll-y>
        <view
          v-for="(item, idx) in categories"
          :key="item.id"
          class="category-item"
          :class="{ active: currentCategory?.id === item.id }"
          @click="onCategoryChange(item)"
        >
          <text>{{ item.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧商品区 -->
      <scroll-view class="category-right" scroll-y @scrolltolower="loadMore">
        <!-- 分类 Banner -->
        <view class="category-banner" v-if="currentCategory">
          <image class="banner-img" :src="currentCategory.banner || '/static/default-banner.png'" mode="aspectFill" />
          <view class="banner-overlay">
            <text class="banner-title">{{ currentCategory.name }}</text>
            <text class="banner-sub">专业甄选，焕发自然光彩</text>
          </view>
        </view>

        <!-- 子分类圆形图标 -->
        <view class="sub-category" v-if="subCategories.length > 0">
          <view
            v-for="sub in subCategories"
            :key="sub.id"
            class="sub-item"
            :class="{ active: currentSubCategory?.id === sub.id }"
            @click="onSubCategoryChange(sub)"
          >
            <view class="sub-icon-wrap">
              <image class="sub-icon-img" :src="sub.icon || '/static/default-icon.png'" mode="aspectFill" />
            </view>
            <text class="sub-name">{{ sub.name }}</text>
          </view>
        </view>

        <!-- 商品列表（卡片形式） -->
        <view class="product-list">
          <view
            v-for="item in products"
            :key="item.id"
            class="product-card"
            @click="goDetail(item)"
          >
            <view class="card-img-wrap">
              <image class="card-img" :src="item.cover_image" mode="aspectFill" />
            </view>
            <view class="card-info">
              <view class="card-tags" v-if="item.tag">
                <text class="card-tag" :style="{ background: 'rgba(187,0,4,0.08)', color: '#bb0004' }">{{ item.tag }}</text>
              </view>
              <text class="card-title">{{ item.title }}</text>
              <view class="card-rating">
                <text class="iconfont star" style="color: #7c5800; font-size: 20rpx;"></text>
                <text class="rating-text">{{ item.rating || '4.9' }} | {{ item.sales_count || '0' }} Sold</text>
              </view>
              <view class="card-bottom">
                <text class="card-price">${{ item.price }}</text>
                <view class="add-cart-btn" @click.stop="addToCart(item)">
                  <text class="iconfont shopping_cart" style="font-size: 28rpx;"></text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="load-more" v-if="products.length > 0">
          <text v-if="loading">加载中...</text>
          <text v-else-if="noMore">没有更多了</text>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="!loading && products.length === 0 && subCategories.length > 0">
          <text class="iconfont inbox" style="font-size: 80rpx; color: #e3e2e2;"></text>
          <text class="empty-text">该分类下暂无商品</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request.js';
import { useCartStore } from '@/stores/cart.js';

const cartStore = useCartStore();
const statusBarHeight = ref(20);
const categories = ref([]);
const subCategories = ref([]);
const products = ref([]);
const currentCategory = ref(null);
const currentSubCategory = ref(null);
const loading = ref(false);
const noMore = ref(false);
const page = ref(1);
const pageSize = 10;

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;
  await loadCategories();
});

async function loadCategories() {
  try {
    const data = await request.get('/category/tree');
    categories.value = data || [];

    if (categories.value.length > 0) {
      onCategoryChange(categories.value[0]);
    }
  } catch (e) {
    console.error('加载分类失败', e);
  }
}

function onCategoryChange(category) {
  currentCategory.value = category;
  subCategories.value = category.children || [];
  currentSubCategory.value = null;
  page.value = 1;
  noMore.value = false;
  products.value = [];

  if (subCategories.value.length > 0) {
    onSubCategoryChange(subCategories.value[0]);
  }
}

function onSubCategoryChange(sub) {
  currentSubCategory.value = sub;
  page.value = 1;
  noMore.value = false;
  products.value = [];
  loadProducts();
}

async function loadProducts(append = false) {
  if (loading.value) return;
  if (!currentSubCategory.value) return;

  loading.value = true;

  try {
    const res = await request.get('/product/list', {
      page: page.value,
      pageSize,
      category_id: currentSubCategory.value?.id,
    });

    const list = (res?.list || []).map(p => ({
      ...p,
      cover_image: request.fixImageUrl(p.cover_image)
    }));

    if (append) {
      products.value = [...products.value, ...list];
    } else {
      products.value = list;
    }

    if (list.length < pageSize) {
      noMore.value = true;
    }
  } catch (e) {
    console.error('加载商品失败', e);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (loading.value) return;

  if (noMore.value) {
    switchToNextSubCategory();
    return;
  }

  page.value++;
  loadProducts(true);
}

function switchToNextSubCategory() {
  if (!subCategories.value.length) return;

  const currentIndex = subCategories.value.findIndex(sub => sub.id === currentSubCategory.value?.id);
  const nextSub = subCategories.value[currentIndex + 1];

  if (nextSub) {
    onSubCategoryChange(nextSub);
  }
}

function goSearch() {
  uni.navigateTo({ url: '/pages/product/list' });
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.id}` });
}

async function addToCart(item) {
  await cartStore.addItem({
    product_id: item.id,
    sku_id: item.sku_id || null,
    title: item.title,
    cover_image: item.cover_image,
    price: item.price,
    quantity: 1,
    stock: item.stock,
  });
}
</script>

<style lang="scss">
/* ============================================================
   分类页 — 参考 stitch_/_2 重构
   ============================================================ */

$primary: #bb0004;
$primary-container: #e1251b;
$on-primary: #ffffff;
$secondary: #7c5800;
$secondary-container: #feb700;
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
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $surface;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.top-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  height: 96rpx;
}

.location {
  display: flex;
  align-items: center;
  gap: 12rpx;

  .iconfont {
    font-size: 36rpx;
    color: $primary;
  }

  .page-title {
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 32rpx;
    color: $on-surface;
    letter-spacing: -0.01em;
  }
}

.top-icons {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.icon-btn {
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
    color: $on-surface-variant;
  }
}

.search-input-wrap {
  display: flex;
  align-items: center;
  height: 72rpx;
  margin: 0 32rpx 20rpx;
  background: $surface-low;
  border-radius: $radius-full;
  padding: 0 24rpx;
  gap: 16rpx;

  .iconfont {
    color: $on-surface-variant;
  }
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: $on-surface;
  background: transparent;
  border: none;
  outline: none;
}

// ── 分类内容区 ──
.category-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding-top: calc(188rpx + env(safe-area-inset-top));
}

// ── 左侧分类导航 ──
.category-left {
  width: 168rpx;
  height: 100%;
  background: $surface-low;
  flex-shrink: 0;
}

.category-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16rpx;
  height: 120rpx;
  font-size: 26rpx;
  color: $on-surface-variant;
  font-weight: 500;
  transition: all 0.2s ease;

  &.active {
    background: $surface-lowest;
    color: $primary;
    font-weight: 800;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 25%;
      height: 50%;
      width: 6rpx;
      background: $primary;
      border-radius: 0 4rpx 4rpx 0;
    }
  }

  &:active:not(.active) {
    background: $surface-high;
  }
}

// ── 右侧商品区 ──
.category-right {
  flex: 1;
  height: 100%;
  background: $surface;
  padding: 0 24rpx;
}

// ── 分类 Banner ──
.category-banner {
  position: relative;
  width: 100%;
  height: 240rpx;
  border-radius: $radius-xl;
  overflow: hidden;
  margin-bottom: 32rpx;

  .banner-img {
    width: 100%;
    height: 100%;
  }

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba($on-surface, 0.6) 0%, transparent 70%);
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .banner-title {
    font-family: 'Manrope', sans-serif;
    font-size: 44rpx;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    margin-bottom: 8rpx;
  }

  .banner-sub {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    max-width: 300rpx;
    line-height: 1.4;
  }
}

// ── 子分类圆形图标 ──
.sub-category {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 32rpx;
  gap: 24rpx;
}

.sub-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  cursor: pointer;

  &.active .sub-icon-wrap {
    border-color: $primary;
  }

  &.active .sub-name {
    color: $primary;
    font-weight: 700;
  }
}

.sub-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  background: $surface-high;
  padding: 4rpx;
  border: 3rpx solid transparent;
  transition: border-color 0.2s ease;

  .sub-icon-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.sub-name {
  font-size: 22rpx;
  color: $on-surface-variant;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  text-align: center;
}

// ── 商品列表（卡片形式，参考 HTML）──
.product-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.product-card {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  background: $surface-lowest;
  border-radius: $radius-xl;
  transition: box-shadow 0.2s ease;

  &:active {
    background: rgba(0, 0, 0, 0.01);
  }

  &:hover {
    box-shadow: 0 12rpx 32rpx rgba(27, 28, 28, 0.06);
  }
}

.card-img-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-md;
  overflow: hidden;
  background: $surface-low;
  flex-shrink: 0;

  .card-img {
    width: 100%;
    height: 100%;
  }
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rpx 0;
}

.card-tags {
  display: flex;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.card-tag {
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-title {
  font-size: 28rpx;
  color: $on-surface;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  margin-bottom: 8rpx;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-bottom: auto;

  .iconfont {
    font-size: 20rpx;
  }

  .rating-text {
    font-size: 20rpx;
    color: $on-surface-variant;
  }
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-price {
  font-family: 'Manrope', sans-serif;
  font-size: 34rpx;
  font-weight: 800;
  color: $primary;
  letter-spacing: -0.02em;
}

.add-cart-btn {
  width: 64rpx;
  height: 64rpx;
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
}

// ── 加载状态 ──
.load-more {
  text-align: center;
  padding: 40rpx 0;
  color: $on-surface-variant;
  font-size: 26rpx;
}

// ── 空状态 ──
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  gap: 20rpx;

  .empty-text {
    font-size: 28rpx;
    color: $on-surface-variant;
  }
}
</style>