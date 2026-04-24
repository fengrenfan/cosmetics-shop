<template>
  <view class="page">
    <!-- 搜索栏（非榜单模式显示） -->
    <view class="search-bar" :style="{ paddingTop: statusBarHeight + 'px' }" v-if="!isRankMode">
      <view class="search-input">
        <text class="iconfont fa-search"></text>
        <input
          class="input"
          v-model="keyword"
          placeholder="搜索商品"
          @confirm="handleSearch"
          @input="onKeywordInput"
          confirm-type="search"
        />
        <text class="iconfont fa-xmark" v-if="keyword" @click="clearKeyword"></text>
      </view>
      <text class="search-btn" @click="handleSearch">搜索</text>
    </view>

    <!-- 筛选栏（非榜单模式显示） -->
    <view class="filter-bar" v-if="!isRankMode">
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: sort === 'sort_order' }"
          @click="onSortChange('sort_order')"
        >
          <text>综合</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: sort === 'sales_count' }"
          @click="onSortChange('sales_count')"
        >
          <text>销量</text>
        </view>
        <view 
          class="filter-tab price" 
          :class="{ active: ['price_asc', 'price_desc'].includes(sort) }"
          @click="onSortChange(sort === 'price_asc' ? 'price_desc' : 'price_asc')"
        >
          <text>价格</text>
          <view class="price-arrow">
            <text class="iconfont fa-chevron-up" :class="{ active: sort === 'price_asc' }"></text>
            <text class="iconfont fa-chevron-down" :class="{ active: sort === 'price_desc' }"></text>
          </view>
        </view>
      </view>
      <view class="filter-action">
        <text class="iconfont fa-filter" @click="showFilter = true"></text>
        <text @click="showFilter = true">筛选</text>
        <view class="view-mode-toggle" @click.stop="toggleViewMode">
          <text class="iconfont" :class="viewMode === 'grid' ? 'fa-table-cells' : 'fa-list'"></text>
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <scroll-view 
      class="product-list" 
      scroll-y 
      @scrolltolower="loadMore"
    >
      <!-- 横向滑动模式 -->
      <view class="product-grid" v-if="viewMode === 'grid'">
        <view 
          class="product-item" 
          v-for="item in productList" 
          :key="item.id"
          @click="goDetail(item)"
        >
          <image class="product-image" :src="item.cover_image" mode="aspectFill" />
          <view class="product-info">
            <text class="product-title">{{ item.title }}</text>
            <text class="product-subtitle">{{ item.subtitle }}</text>
            <view class="product-bottom">
              <view class="product-price">
                <text class="current-price">¥{{ item.price }}</text>
                <text class="original-price" v-if="item.original_price">¥{{ item.original_price }}</text>
              </view>
              <view class="add-cart" @click.stop="addToCart(item)">
                <text class="iconfont fa-cart-shopping"></text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 列表模式 -->
      <view class="product-list-mode" v-else>
        <view 
          class="product-list-item" 
          v-for="item in productList" 
          :key="item.id"
          @click="goDetail(item)"
        >
          <image class="item-image" :src="item.cover_image" mode="aspectFill" />
          <view class="item-info">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-subtitle">{{ item.subtitle }}</text>
            <view class="item-tags">
              <text class="tag" v-if="item.is_new">新品</text>
              <text class="tag hot" v-if="item.is_hot">热卖</text>
            </view>
            <view class="item-bottom">
              <view class="item-price">
                <text class="current-price">¥{{ item.price }}</text>
                <text class="original-price" v-if="item.original_price">¥{{ item.original_price }}</text>
              </view>
              <view class="item-sales">已售{{ item.sales_count || 0 }}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="load-more" v-if="productList.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
        <text v-else @click="loadMore">加载更多</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && productList.length === 0">
        <image src="/static/empty-search.png" mode="aspectFit" />
        <text>暂无相关商品</text>
      </view>
    </scroll-view>

    <!-- 筛选弹窗 -->
    <view class="filter-modal" v-if="showFilter" @click="showFilter = false">
      <view class="filter-content" @click.stop>
        <view class="filter-header">
          <text class="filter-title">筛选</text>
          <text class="filter-reset" @click="resetFilter">重置</text>
        </view>

        <view class="filter-body">
          <!-- 分类筛选 -->
          <view class="filter-section">
            <text class="section-title">分类</text>
            <!-- 一级分类 -->
            <view class="parent-categories">
              <view
                class="tag-item parent"
                :class="{ active: selectedParentId === item.id }"
                v-for="item in parentCategories"
                :key="item.id"
                @click="toggleParent(item)"
              >
                {{ item.name }}
              </view>
            </view>
            <!-- 二级分类 -->
            <view class="child-categories" v-if="childCategories.length > 0">
              <view
                class="tag-item child"
                :class="{ active: isCategorySelected(child.id) }"
                v-for="child in childCategories"
                :key="child.id"
                @click="toggleChild(child)"
              >
                {{ child.name }}
              </view>
            </view>
          </view>

          <!-- 价格区间 -->
          <view class="filter-section">
            <text class="section-title">价格区间</text>
            <view class="price-range">
              <input class="range-input" type="number" v-model="filterForm.minPrice" placeholder="最低价" />
              <text class="range-line">-</text>
              <input class="range-input" type="number" v-model="filterForm.maxPrice" placeholder="最高价" />
            </view>
          </view>

          <!-- 商品标签 -->
          <view class="filter-section">
            <text class="section-title">商品标签</text>
            <view class="tag-list">
              <view 
                class="tag-item" 
                :class="{ active: filterForm.is_new }"
                @click="filterForm.is_new = !filterForm.is_new"
              >
                新品
              </view>
              <view 
                class="tag-item" 
                :class="{ active: filterForm.is_hot }"
                @click="filterForm.is_hot = !filterForm.is_hot"
              >
                热卖
              </view>
              <view 
                class="tag-item" 
                :class="{ active: filterForm.is_recommend }"
                @click="filterForm.is_recommend = !filterForm.is_recommend"
              >
                推荐
              </view>
            </view>
          </view>
        </view>

        <view class="filter-footer">
          <view class="btn-cancel" @click="showFilter = false">取消</view>
          <view class="btn-confirm" @click="applyFilter">确定</view>
        </view>
      </view>
    </view>

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
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import { useCartStore } from '@/stores/cart.js';
import SkuSelectModal from '@/components/SkuSelectModal.vue';

const cartStore = useCartStore();

const statusBarHeight = ref(20);
const keyword = ref('');
const sort = ref('sort_order');
const categoryId = ref(null);
const viewMode = ref('grid');
const productList = ref([]);
const loading = ref(false);
const noMore = ref(false);
const page = ref(1);
const pageSize = 20;
const showFilter = ref(false);
const showSkuModal = ref(false);
const currentProduct = ref(null);
let searchTimer = null;

const filterForm = ref({
  minPrice: '',
  maxPrice: '',
  is_new: false,
  is_hot: false,
  is_recommend: false,
  category_id: null
});

const categoryList = ref([]);
const selectedParentId = ref(null);
const selectedCategories = ref([]); // 已选中的分类ID数组

// 一级分类
const parentCategories = computed(() => {
  return categoryList.value.filter(c => c.level === 1);
});

const isRankMode = ref(false);

// 根据选中的一级分类显示二级分类
const childCategories = computed(() => {
  if (!selectedParentId.value) return [];
  const parent = categoryList.value.find(c => c.id === selectedParentId.value);
  return parent?.children || [];
});

function isCategorySelected(id) {
  return selectedCategories.value.includes(id);
}

function toggleParent(item) {
  if (selectedParentId.value === item.id) {
    selectedParentId.value = null;
  } else {
    selectedParentId.value = item.id;
  }
}

function toggleChild(child) {
  const idx = selectedCategories.value.indexOf(child.id);
  if (idx >= 0) {
    selectedCategories.value.splice(idx, 1);
  } else {
    selectedCategories.value.push(child.id);
  }
}

onLoad((options) => {
  if (options.keyword) keyword.value = options.keyword;
  if (options.category_id) {
    categoryId.value = options.category_id;
    filterForm.value.category_id = options.category_id;
  }
  if (options.title) {
    uni.setNavigationBarTitle({ title: options.title });
  }
  if (options.rank === 'hot') {
    isRankMode.value = true;
    uni.setNavigationBarTitle({ title: '热销榜单' });
    loadHotProducts();
  } else {
    loadCategories();
    loadData();
  }
});

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 20;

  if (productList.value.length === 0 && !categoryId.value && !keyword.value) {
    // 只在非榜单模式下加载分类
  }
});

async function loadHotProducts() {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await request.get('/product-recommend/hot');
    productList.value = (res || []).map(p => request.normalizeProduct(p));
    noMore.value = true;
  } catch (e) {
    console.error('加载热销榜单失败', e);
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  try {
    const res = await request.get('/category/tree');
    categoryList.value = res || [];
  } catch (e) {
    console.error('加载分类失败', e);
  }
}

async function loadData(append = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    const params = {
      page: page.value,
      pageSize,
    };

    if (keyword.value) params.keyword = keyword.value;
    if (categoryId.value) params.category_id = categoryId.value;
    if (selectedCategories.value.length > 0) {
      params.category_id = selectedCategories.value.join(',');
    }
    if (filterForm.value.minPrice) params.min_price = filterForm.value.minPrice;
    if (filterForm.value.maxPrice) params.max_price = filterForm.value.maxPrice;
    if (filterForm.value.is_new) params.is_new = 1;
    if (filterForm.value.is_hot) params.is_hot = 1;
    if (filterForm.value.is_recommend) params.is_recommend = 1;

    const res = await request.get('/product/list', params);
    const list = (res?.list || []).map(p => request.normalizeProduct(p));

    if (append) {
      productList.value = [...productList.value, ...list];
    } else {
      productList.value = list;
    }

    if (!res?.pagination || res.pagination.page >= res.pagination.totalPages) {
      noMore.value = true;
    }
  } catch (e) {
    console.error('加载商品失败', e);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (noMore.value || loading.value) return;
  page.value++;
  loadData(true);
}

function handleSearch() {
  page.value = 1;
  noMore.value = false;
  loadData();
}

function clearKeyword() {
  keyword.value = '';
  page.value = 1;
  noMore.value = false;
  loadData();
}

function onKeywordInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    handleSearch();
  }, 500);
}

function onSortChange(newSort) {
  if (sort.value === newSort) return;
  sort.value = newSort;
  page.value = 1;
  noMore.value = false;
  loadData();
}

function resetFilter() {
  filterForm.value = {
    minPrice: '',
    maxPrice: '',
    is_new: false,
    is_hot: false,
    is_recommend: false,
    category_id: null
  };
  selectedParentId.value = null;
  selectedCategories.value = [];
}

function applyFilter() {
  showFilter.value = false;
  page.value = 1;
  noMore.value = false;
  loadData();
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.id}` });
}

async function addToCart(item) {
  // 有规格的商品弹出规格选择弹窗
  if (item.skus?.length > 0) {
    currentProduct.value = item;
    showSkuModal.value = true;
    return;
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
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  height: 64rpx;
  padding: 0 20rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  
  .search-icon {
    font-size: 28rpx;
    color: #999;
    margin-right: 12rpx;
  }
  
  .clear-icon {
    font-size: 28rpx;
    color: #999;
    margin-left: 12rpx;
  }
  
  .input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }
}

.search-btn {
  font-size: 28rpx;
  color: #bb0004;
  white-space: nowrap;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f5f5f5;
}

.filter-tabs {
  display: flex;
}

.filter-tab {
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #666;
  
  &.active {
    color: #ff4a8d;
    font-weight: bold;
  }
  
  &.price {
    display: flex;
    align-items: center;
  }
}

.price-arrow {
  display: flex;
  flex-direction: column;
  margin-left: 8rpx;
  
  .iconfont {
    font-size: 16rpx;
    color: #ccc;
    line-height: 1;
    
    &:first-child {
      margin-bottom: 4rpx;
    }
    
    &.active {
      color: #ff4a8d;
    }
  }
}

.filter-action {
  display: flex;
  align-items: center;

  .iconfont {
    font-size: 32rpx;
    margin-right: 8rpx;
  }

  text:last-child {
    font-size: 26rpx;
    color: #666;
  }
}

.view-mode-toggle {
  margin-left: 20rpx;
  padding: 8rpx;
  background: #f5f5f5;
  border-radius: 8rpx;

  .iconfont {
    font-size: 32rpx;
    color: #666;
  }
}

.product-list {
  flex: 1;
  overflow: hidden;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.product-item {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 340rpx;
  background: #f5f5f5;
}

.product-info {
  padding: 20rpx;
}

.product-title {
  font-size: 28rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-subtitle {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.current-price {
  font-size: 32rpx;
  color: #ff4a8d;
  font-weight: bold;
}

.original-price {
  font-size: 22rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 8rpx;
}

.add-cart {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  border-radius: 50%;

  .iconfont {
    font-size: 24rpx;
    color: #fff;
  }
}

// 列表模式
.product-list-mode {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.product-list-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.item-image {
  width: 240rpx;
  height: 240rpx;
  background: #f5f5f5;
}

.item-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 28rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-subtitle {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
  
  .tag {
    padding: 4rpx 12rpx;
    background: #fdf0f5;
    color: #ff4a8d;
    font-size: 20rpx;
    border-radius: 4rpx;
    
    &.hot {
      background: #fff3e6;
      color: #ff9500;
    }
  }
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.item-sales {
  font-size: 22rpx;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  
  image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 20rpx;
  }
  
  text {
    font-size: 28rpx;
    color: #999;
  }
}

// 筛选弹窗
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
}

.filter-content {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 600rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.filter-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.filter-reset {
  font-size: 26rpx;
  color: #ff4a8d;
}

.filter-body {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 40rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.price-range {
  display: flex;
  align-items: center;
}

.range-input {
  flex: 1;
  height: 64rpx;
  padding: 0 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  text-align: center;
}

.range-line {
  margin: 0 20rpx;
  color: #999;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag-item {
  padding: 16rpx 32rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;

  &.active {
    background: #ffe6f0;
    color: #ff4a8d;
  }

  &.parent {
    font-weight: bold;
  }

  &.child {
    font-size: 24rpx;
    padding: 12rpx 24rpx;
  }
}

.parent-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.child-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.filter-footer {
  display: flex;
  padding: 20rpx;
  gap: 20rpx;
  
  view {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 44rpx;
    font-size: 30rpx;
  }
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  color: #fff;
}
</style>
