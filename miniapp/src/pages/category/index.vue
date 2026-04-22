<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="top-bar-inner">
        <view class="location">
          <text class="material-symbols-outlined" style="color: #bb0004;">location_on</text>
          <text class="page-title">分类</text>
        </view>
        <view class="top-icons">
          <view class="icon-btn" @click="goSearch">
            <text class="material-symbols-outlined">search</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分类内容 -->
    <view class="category-content">
      <!-- 左侧分类 -->
      <scroll-view
        class="category-left"
        scroll-y
        :scroll-top="categoryScrollTop"
        scroll-with-animation
      >
        <view
          v-for="item in categories"
          :key="item.id"
          class="category-item"
          :class="{ active: currentCategory?.id === item.id }"
          @click="onCategoryChange(item)"
        >
          <text class="category-name">{{ item.name }}</text>
          <text class="category-count" v-if="item.product_count">{{ item.product_count }}</text>
        </view>

        <!-- 加载状态 -->
        <view class="category-loading" v-if="categoriesLoading">
          <text class="loading-text">加载中...</text>
        </view>
      </scroll-view>

      <!-- 右侧商品区 -->
      <scroll-view
        class="category-right"
        scroll-y
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        @scrolltolower="loadMore"
      >
        <!-- 分类 Banner -->
        <view class="category-banner" v-if="currentCategory">
          <image
            class="banner-img"
            :src="currentCategory.banner || '/static/default-banner.png'"
            mode="aspectFill"
            :lazy-load="true"
          />
          <view class="banner-overlay">
            <text class="banner-title">{{ currentCategory.name }}</text>
            <text class="banner-sub">专业甄选，焕发自然光彩</text>
          </view>
        </view>

        <!-- 子分类 + 排序/筛选 -->
        <view class="toolbar" v-if="subCategories.length > 0">
          <!-- 子分类横向滚动 -->
          <view class="sub-category">
            <view
              v-for="sub in subCategories"
              :key="sub.id"
              class="sub-item"
              :class="{ active: currentSubCategory?.id === sub.id }"
              @click="onSubCategoryChange(sub)"
            >
              <view class="sub-icon-wrap">
                <image
                  class="sub-icon-img"
                  :src="sub.icon || '/static/default-icon.png'"
                  mode="aspectFill"
                  :lazy-load="true"
                />
              </view>
              <text class="sub-name">{{ sub.name }}</text>
              <text class="sub-count" v-if="sub.product_count">{{ sub.product_count }}</text>
            </view>
          </view>

          <!-- 排序和筛选 -->
          <view class="filter-bar">
            <view class="sort-tabs">
              <text
                v-for="sort in sortOptions"
                :key="sort.value"
                class="sort-tab"
                :class="{ active: currentSort === sort.value }"
                @click="onSortChange(sort.value)"
              >{{ sort.label }}</text>
            </view>
            <view class="filter-btn" @click="showFilter = !showFilter">
              <text class="material-symbols-outlined">filter_list</text>
              <text>筛选</text>
            </view>
          </view>

          <!-- 筛选面板 -->
          <view class="filter-panel" v-if="showFilter" @click.stop>
            <view class="filter-section">
              <text class="filter-title">价格区间</text>
              <view class="filter-inputs">
                <input
                  class="filter-input"
                  v-model="filterPriceMin"
                  type="number"
                  placeholder="最低价"
                />
                <text class="filter-separator">-</text>
                <input
                  class="filter-input"
                  v-model="filterPriceMax"
                  type="number"
                  placeholder="最高价"
                />
              </view>
            </view>
            <view class="filter-section">
              <text class="filter-title">仅显示有货</text>
              <switch :checked="filterInStock" @change="filterInStock = $event.detail.value" color="#bb0004" />
            </view>
            <view class="filter-actions">
              <view class="filter-reset" @click="resetFilter">重置</view>
              <view class="filter-apply" @click="applyFilter">应用</view>
            </view>
          </view>
        </view>

        <!-- 商品列表（卡片形式） -->
        <view class="product-list" v-if="products.length > 0">
          <view
            v-for="item in products"
            :key="item.id"
            class="product-card"
            :class="{ 'card-animate': true }"
            @click="goDetail(item)"
          >
            <view class="card-img-wrap">
              <image
                class="card-img"
                :src="item.cover_image"
                mode="aspectFill"
                :lazy-load="true"
              />
              <view class="stock-tag" v-if="item.stock <= 10 && item.stock > 0">仅剩{{ item.stock }}</view>
              <view class="stock-tag out" v-if="item.stock === 0">缺货</view>
            </view>
            <view class="card-info">
              <view class="card-tags" v-if="item.tag">
                <text class="card-tag">{{ item.tag }}</text>
              </view>
              <text class="card-title">{{ item.title }}</text>
              <view class="card-rating">
                <text class="material-symbols-outlined" style="color: #7c5800; font-size: 20rpx;">star</text>
                <text class="rating-text">{{ item.rating || '4.9' }} | {{ item.sales_count || '0' }} 已售</text>
              </view>
              <view class="card-bottom">
                <view class="price-wrap">
                  <text class="card-price">¥{{ item.price }}</text>
                  <text class="card-original" v-if="item.original_price > item.price">
                    ¥{{ item.original_price }}
                  </text>
                </view>
                <view class="add-cart-btn" @click.stop="addToCart(item)">
                  <text class="material-symbols-outlined add-cart-icon">add_shopping_cart</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="load-more" v-if="products.length > 0">
          <view class="loading-spinner" v-if="loading"></view>
          <text v-if="!loading && noMore">没有更多了</text>
          <text v-if="!loading && !noMore && products.length > 0" @click="loadMore">加载更多</text>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="!loading && products.length === 0 && subCategories.length > 0">
          <text class="material-symbols-outlined empty-icon">inbox</text>
          <text class="empty-text">该分类下暂无商品</text>
          <view class="empty-btn" @click="resetFilter" v-if="hasActiveFilter">清除筛选</view>
        </view>

        <!-- 初始加载状态 -->
        <view class="init-loading" v-if="initLoading">
          <view class="loading-spinner large"></view>
          <text class="loading-tip">加载中...</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import request from '@/utils/request.js';
import { useCartStore } from '@/stores/cart.js';

// 常量配置
const PAGE_SIZE = 10;
const SCROLL_TOP_RESET = 0;

// 排序选项
const sortOptions = [
  { label: '综合', value: 'sort_order', order: 'desc' },
  { label: '销量', value: 'sales_count', order: 'desc' },
  { label: '价格', value: 'price', order: 'asc' },
  { label: '新品', value: 'created_at', order: 'desc' }
];

// Store
const cartStore = useCartStore();

// 状态
const statusBarHeight = ref(20);
const categories = ref([]);
const subCategories = ref([]);
const products = ref([]);
const currentCategory = ref(null);
const currentSubCategory = ref(null);

// 加载状态
const loading = ref(false);
const initLoading = ref(false);
const refreshing = ref(false);
const noMore = ref(false);
const categoriesLoading = ref(false);
const showFilter = ref(false);

// 分页
const page = ref(1);

// 排序和筛选
const currentSort = ref('sort_order');
const filterPriceMin = ref('');
const filterPriceMax = ref('');
const filterInStock = ref(false);
const hasActiveFilter = computed(() => {
  return filterPriceMin.value || filterPriceMax.value || filterInStock.value;
});

// 分类滚动定位
const categoryScrollTop = ref(0);

// 防抖计时器
let categoryChangeTimer = null;
let filterTimer = null;

onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;
  await loadCategories();
});

// 加载一级分类
async function loadCategories() {
  categoriesLoading.value = true;
  try {
    const data = await request.get('/category/tree');
    categories.value = data || [];

    if (categories.value.length > 0) {
      await nextTick();
      onCategoryChange(categories.value[0]);
    }
  } catch (e) {
    console.error('加载分类失败', e);
    uni.showToast({ title: '加载分类失败', icon: 'none' });
  } finally {
    categoriesLoading.value = false;
  }
}

// 分类切换（带防抖）
function onCategoryChange(category) {
  // 防抖处理
  if (categoryChangeTimer) {
    clearTimeout(categoryChangeTimer);
  }

  categoryChangeTimer = setTimeout(async () => {
    currentCategory.value = category;
    subCategories.value = category.children || [];
    currentSubCategory.value = null;

    // 重置状态
    resetProductList();

    // 滚动到顶部
    categoryScrollTop.value = SCROLL_TOP_RESET;

    // 默认选中第一个子分类
    if (subCategories.value.length > 0) {
      onSubCategoryChange(subCategories.value[0]);
    }
  }, 50);
}

// 子分类切换
function onSubCategoryChange(sub) {
  // 防抖处理
  if (filterTimer) {
    clearTimeout(filterTimer);
  }

  filterTimer = setTimeout(() => {
    currentSubCategory.value = sub;
    resetProductList();
    loadProducts();
  }, 50);
}

// 排序切换
function onSortChange(sort) {
  if (currentSort.value === sort) return;
  currentSort.value = sort;
  resetProductList();
  loadProducts();
}

// 重置商品列表
function resetProductList() {
  page.value = 1;
  noMore.value = false;
  products.value = [];
}

// 加载商品
async function loadProducts(append = false) {
  if (loading.value) return;
  if (!currentSubCategory.value) return;

  loading.value = true;

  try {
    // 获取当前排序选项
    const currentSortOption = sortOptions.find(s => s.value === currentSort.value) || sortOptions[0];

    const params = {
      page: page.value,
      pageSize: PAGE_SIZE,
      category_id: currentSubCategory.value.id,
      sort: currentSortOption.value,
      order: currentSortOption.order
    };

    // 添加筛选参数
    if (filterPriceMin.value) {
      params.min_price = filterPriceMin.value;
    }
    if (filterPriceMax.value) {
      params.max_price = filterPriceMax.value;
    }
    if (filterInStock.value) {
      params.in_stock = 1;
    }

    const res = await request.get('/product/list', params);

    const list = (res?.list || []).map(p => request.normalizeProduct(p));

    if (append) {
      products.value = [...products.value, ...list];
    } else {
      products.value = list;
    }

    if (!res?.pagination || res.pagination.page >= res.pagination.totalPages) {
      noMore.value = true;
    }
  } catch (e) {
    console.error('加载商品失败', e);
    if (!append) {
      uni.showToast({ title: '加载商品失败', icon: 'none' });
    }
  } finally {
    loading.value = false;
  }
}

// 下拉刷新
async function onRefresh() {
  if (refreshing.value) return;

  refreshing.value = true;
  resetProductList();

  try {
    await loadProducts();
  } finally {
    refreshing.value = false;
  }
}

// 加载更多
function loadMore() {
  if (loading.value || noMore.value) return;

  page.value++;
  loadProducts(true);
}

// 切换到下一个子分类
function switchToNextSubCategory() {
  if (!subCategories.value.length) return;

  const currentIndex = subCategories.value.findIndex(sub => sub.id === currentSubCategory.value?.id);
  const nextSub = subCategories.value[currentIndex + 1];

  if (nextSub) {
    onSubCategoryChange(nextSub);
  } else {
    noMore.value = true;
  }
}

// 重置筛选
function resetFilter() {
  filterPriceMin.value = '';
  filterPriceMax.value = '';
  filterInStock.value = false;
  showFilter.value = false;
  resetProductList();
  loadProducts();
}

// 应用筛选
function applyFilter() {
  showFilter.value = false;
  resetProductList();
  loadProducts();
}

// 跳转搜索
function goSearch() {
  uni.navigateTo({ url: '/pages/product/list' });
}

// 跳转详情
function goDetail(item) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.id}` });
}

// 添加购物车
async function addToCart(item) {
  if (item.stock === 0) {
    uni.showToast({ title: '商品已售罄', icon: 'none' });
    return;
  }

  try {
    await cartStore.addItem({
      product_id: item.id,
      sku_id: item.sku_id || null,
      title: item.title,
      cover_image: item.cover_image,
      price: item.price,
      quantity: 1,
      stock: item.stock,
    });
    uni.showToast({ title: '已加入购物车', icon: 'success' });
  } catch (e) {
    console.error('加入购物车失败', e);
    uni.showToast({ title: '加入购物车失败', icon: 'none' });
  }
}
</script>

<style lang="scss">
/* ============================================================
   分类页 — 全面优化重构
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
  position: relative;
}

// ── 顶部导航栏 ──
.top-bar {
  width: 100%;
  height: calc(96rpx + env(safe-area-inset-top));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  padding-top: env(safe-area-inset-top);
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

// ── 分类内容区 ──
.category-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

// ── 左侧分类导航 ──
.category-left {
  width: 168rpx;
  background: $surface-low;
  flex-shrink: 0;

  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

.category-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16rpx;
  height: 120rpx;
  transition: all 0.2s ease;

  &.active {
    background: $surface-lowest;
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

    .category-name {
      color: $primary;
    }
  }

  &:active:not(.active) {
    background: $surface-high;
  }
}

.category-name {
  font-size: 26rpx;
  color: $on-surface-variant;
  font-weight: 500;
  text-align: center;
  max-width: 140rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-count {
  position: absolute;
  top: 16rpx;
  right: 12rpx;
  font-size: 18rpx;
  color: $on-surface-variant;
  background: rgba($primary, 0.1);
  padding: 2rpx 8rpx;
  border-radius: $radius-full;
}

.category-loading {
  padding: 20rpx;
  text-align: center;

  .loading-text {
    font-size: 24rpx;
    color: $on-surface-variant;
  }
}

// ── 右侧商品区 ──
.category-right {
  flex: 1;
  width: 0;
  background: $surface;
  padding: 0 24rpx;
  position: relative;
  box-sizing: border-box;

  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

// ── 分类 Banner ──
.category-banner {
  position: relative;
  width: 100%;
  height: 200rpx;
  border-radius: $radius-xl;
  overflow: hidden;
  margin: 24rpx 0;
  background: $surface-high;

  .banner-img {
    width: 100%;
    height: 100%;
  }

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba($primary, 0.85) 0%,
      rgba($primary-container, 0.6) 40%,
      transparent 100%
    );
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .banner-title {
    font-family: 'Manrope', sans-serif;
    font-size: 38rpx;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    margin-bottom: 6rpx;
  }

  .banner-sub {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.85);
    max-width: 280rpx;
    line-height: 1.4;
  }
}

// ── 工具栏 ──
.toolbar {
  margin-bottom: 24rpx;
}

// ── 子分类横向滚动 ──
.sub-category {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  padding: 8rpx 0;

  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

.sub-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin-right: 32rpx;
  position: relative;
  width: 120rpx;
  flex-shrink: 0;

  &.active {
    .sub-icon-wrap {
      border-color: $primary;
    }

    .sub-name {
      color: $primary;
      font-weight: 700;
    }
  }
}

.sub-icon-wrap {
  width: 96rpx;
  height: 96rpx;
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
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.sub-count {
  position: absolute;
  top: -4rpx;
  right: -8rpx;
  font-size: 16rpx;
  color: #fff;
  background: $primary;
  padding: 2rpx 8rpx;
  border-radius: $radius-full;
  min-width: 32rpx;
  text-align: center;
}

// ── 排序和筛选 ──
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-top: 1rpx solid $outline-variant;
  border-bottom: 1rpx solid $outline-variant;
}

.sort-tabs {
  display: flex;
  gap: 32rpx;
}

.sort-tab {
  font-size: 26rpx;
  color: $on-surface-variant;
  font-weight: 500;
  transition: color 0.2s;

  &.active {
    color: $primary;
    font-weight: 700;
  }
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 26rpx;
  color: $on-surface-variant;
  padding: 8rpx 16rpx;
  background: $surface-low;
  border-radius: $radius-md;

  .iconfont {
    font-size: 28rpx;
  }
}

// ── 筛选面板 ──
.filter-panel {
  background: $surface-lowest;
  border-radius: $radius-lg;
  padding: 24rpx;
  margin-top: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $outline-variant;

  &:last-of-type {
    border-bottom: none;
  }
}

.filter-title {
  font-size: 26rpx;
  color: $on-surface;
  font-weight: 500;
}

.filter-inputs {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.filter-input {
  width: 140rpx;
  height: 64rpx;
  background: $surface-low;
  border-radius: $radius-md;
  padding: 0 16rpx;
  font-size: 24rpx;
  text-align: center;
}

.filter-separator {
  color: $on-surface-variant;
}

.filter-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.filter-reset {
  flex: 1;
  height: 72rpx;
  background: $surface-high;
  color: $on-surface-variant;
  font-size: 26rpx;
  font-weight: 600;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-apply {
  flex: 2;
  height: 72rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  font-size: 26rpx;
  font-weight: 600;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
}

// ── 商品列表 ──
.product-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.product-card {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: $surface-lowest;
  border-radius: $radius-xl;
  transition: all 0.2s ease;

  &.card-animate {
    animation: fadeInUp 0.3s ease forwards;
  }

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-img-wrap {
  position: relative;
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

.stock-tag {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  font-size: 18rpx;
  color: #fff;
  background: rgba($primary, 0.9);
  padding: 4rpx 10rpx;
  border-radius: $radius-sm;

  &.out {
    background: rgba(#999, 0.9);
  }
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.card-tags {
  display: flex;
  gap: 8rpx;
  margin-bottom: 6rpx;
}

.card-tag {
  font-size: 18rpx;
  font-weight: 700;
  padding: 4rpx 10rpx;
  border-radius: $radius-sm;
  background: rgba($primary, 0.08);
  color: $primary;
  text-transform: uppercase;
  letter-spacing: 0.03em;
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
  margin-bottom: 6rpx;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 6rpx;

  .iconfont {
    font-size: 18rpx;
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

.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.card-price {
  font-family: 'Manrope', sans-serif;
  font-size: 32rpx;
  font-weight: 800;
  color: $primary;
  letter-spacing: -0.02em;
}

.card-original {
  font-size: 22rpx;
  color: $on-surface-variant;
  text-decoration: line-through;
}

.add-cart-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.9);
    opacity: 0.8;
  }

  .add-cart-icon {
    font-size: 36rpx;
    color: #fff;
  }
}

// ── 加载状态 ──
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
  color: $on-surface-variant;
  font-size: 26rpx;
  gap: 12rpx;
}

.loading-spinner {
  width: 36rpx;
  height: 36rpx;
  border: 3rpx solid $surface-high;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  &.large {
    width: 64rpx;
    height: 64rpx;
    border-width: 4rpx;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// ── 空状态 ──
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  gap: 20rpx;

  .empty-icon {
    font-size: 80rpx;
    color: $surface-high;
  }

  .empty-text {
    font-size: 28rpx;
    color: $on-surface-variant;
  }
}

.empty-btn {
  margin-top: 16rpx;
  padding: 16rpx 48rpx;
  background: $surface-low;
  color: $on-surface;
  font-size: 26rpx;
  font-weight: 600;
  border-radius: $radius-full;
}

// ── 初始加载 ──
.init-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  background: $surface;

  .loading-tip {
    font-size: 28rpx;
    color: $on-surface-variant;
  }
}
</style>
