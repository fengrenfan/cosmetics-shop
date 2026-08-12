<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-header">
      <view class="search-bar">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索护肤品、化妆品..."
          :focus="true"
          confirm-type="search"
          @confirm="doSearch"
        />
        <uni-icons v-if="keyword" type="clear" size="16" color="#ccc" @click="keyword = ''"></uni-icons>
      </view>
      <text class="search-btn" @click="doSearch">搜索</text>
    </view>

    <!-- 搜索历史 -->
    <view class="section" v-if="!keyword && searchHistory.length > 0">
      <view class="section-header">
        <text class="section-title">搜索历史</text>
        <text class="section-clear" @click="clearHistory">清除</text>
      </view>
      <view class="tag-list">
        <view class="tag-item" v-for="item in searchHistory" :key="item" @click="searchByTag(item)">
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view class="section" v-if="!keyword">
      <view class="section-header">
        <text class="section-title">热门搜索</text>
      </view>
      <view class="tag-list">
        <view class="tag-item hot" v-for="item in hotKeywords" :key="item" @click="searchByTag(item)">
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 排序栏 -->
    <view class="sort-bar" v-if="searched">
      <view
        class="sort-item"
        :class="{ active: currentSort === item.value }"
        v-for="item in sortOptions"
        :key="item.value"
        @click="changeSort(item.value)"
      >
        <text>{{ item.label }}</text>
        <uni-icons v-if="item.value === 'price_asc'" type="up" size="10" :color="currentSort === 'price_asc' ? '#bb0004' : '#999'"></uni-icons>
        <uni-icons v-if="item.value === 'price_desc'" type="down" size="10" :color="currentSort === 'price_desc' ? '#bb0004' : '#999'"></uni-icons>
      </view>
    </view>

    <!-- 搜索结果 -->
    <scroll-view class="result-list" scroll-y @scrolltolower="loadMore" v-if="searched">
      <view class="product-item" v-for="item in productList" :key="item.id" @click="goDetail(item)">
        <image class="product-image" :src="item.cover_image" mode="aspectFill"></image>
        <view class="product-info">
          <text class="product-title">{{ item.title }}</text>
          <text class="product-subtitle" v-if="item.subtitle">{{ item.subtitle }}</text>
          <view class="product-bottom">
            <text class="product-price">¥{{ item.price }}</text>
            <text class="product-sales">已售{{ item.sales_count || 0 }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="productList.length === 0 && !loading">
        <text>暂无相关商品</text>
      </view>

      <!-- 加载状态 -->
      <view class="load-more" v-if="productList.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const keyword = ref('');
const searched = ref(false);
const loading = ref(false);
const noMore = ref(false);
const page = ref(1);
const productList = ref([]);
const currentSort = ref('default');
const searchHistory = ref([]);
const hotKeywords = ref(['面膜', '口红', '精华液', '防晒霜', '洗面奶', '眼霜', '粉底液', '卸妆水']);

const sortOptions = [
  { label: '综合', value: 'default' },
  { label: '销量', value: 'sales_desc' },
  { label: '价格', value: 'price_asc' },
  { label: '最新', value: 'newest' },
];

onMounted(() => {
  const history = uni.getStorageSync('search_history');
  if (history) searchHistory.value = JSON.parse(history);
});

function doSearch() {
  const kw = keyword.value.trim();
  if (!kw) return;
  saveHistory(kw);
  page.value = 1;
  productList.value = [];
  noMore.value = false;
  searched.value = true;
  fetchProducts();
}

function searchByTag(kw) {
  keyword.value = kw;
  doSearch();
}

function changeSort(sort) {
  currentSort.value = sort;
  page.value = 1;
  productList.value = [];
  noMore.value = false;
  fetchProducts();
}

async function fetchProducts() {
  if (loading.value) return;
  loading.value = true;

  try {
    const params = {
      keyword: keyword.value,
      page: page.value,
      pageSize: 20,
      status: 1,
    };

    if (currentSort.value === 'sales_desc') {
      params.sort = 'sales_count';
      params.order = 'desc';
    } else if (currentSort.value === 'price_asc') {
      params.sort = 'price';
      params.order = 'asc';
    } else if (currentSort.value === 'price_desc') {
      params.sort = 'price';
      params.order = 'desc';
    } else if (currentSort.value === 'newest') {
      params.sort = 'created_at';
      params.order = 'desc';
    }

    const res = await uni.request({
      url: '/api/product/list',
      method: 'GET',
      data: params,
    });

    const data = res.data?.data || res.data;
    if (data?.list) {
      if (page.value === 1) {
        productList.value = data.list;
      } else {
        productList.value.push(...data.list);
      }
      if (data.list.length < 20) noMore.value = true;
    }
  } catch (e) {
    console.error('搜索失败', e);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (noMore.value || loading.value) return;
  page.value++;
  fetchProducts();
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.id}` });
}

function saveHistory(kw) {
  let history = searchHistory.value.filter(h => h !== kw);
  history.unshift(kw);
  if (history.length > 15) history = history.slice(0, 15);
  searchHistory.value = history;
  uni.setStorageSync('search_history', JSON.stringify(history));
}

function clearHistory() {
  searchHistory.value = [];
  uni.removeStorageSync('search_history');
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}
.search-header {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 16rpx 24rpx;
  gap: 12rpx;
}
.search-input {
  flex: 1;
  font-size: 28rpx;
  background: transparent;
}
.search-btn {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #bb0004;
  white-space: nowrap;
}
.section {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}
.section-clear {
  font-size: 24rpx;
  color: #999;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.tag-item {
  padding: 10rpx 24rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #666;
}
.tag-item.hot {
  background: #fff5f5;
  color: #bb0004;
}
.sort-bar {
  display: flex;
  background: #fff;
  padding: 16rpx 24rpx;
  gap: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.sort-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 26rpx;
  color: #666;
}
.sort-item.active {
  color: #bb0004;
  font-weight: 600;
}
.result-list {
  height: calc(100vh - 200rpx);
}
.product-item {
  display: flex;
  background: #fff;
  padding: 20rpx 24rpx;
  gap: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.product-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}
.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #bb0004;
}
.product-sales {
  font-size: 22rpx;
  color: #999;
}
.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
.load-more {
  text-align: center;
  padding: 24rpx;
  color: #999;
  font-size: 24rpx;
}
</style>
