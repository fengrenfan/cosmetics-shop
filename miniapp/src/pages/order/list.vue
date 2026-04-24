<template>
  <view class="page">
    <!-- Tab 栏 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === item.value }"
        v-for="item in tabs" 
        :key="item.value"
        @click="onTabChange(item.value)"
      >
        <text>{{ item.label }}</text>
        <view class="tab-badge" v-if="item.count > 0">{{ item.count > 99 ? '99+' : item.count }}</view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view class="order-list" scroll-y @scrolltolower="loadMore">
      <view class="order-item" v-for="order in orderList" :key="order.id" @click="goDetail(order)">
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-no">订单号: {{ order.order_no }}</text>
          <text class="order-status" :class="order.status">{{ getStatusText(order.status) }}</text>
        </view>

        <!-- 商品列表 -->
        <view class="goods-list">
          <view class="goods-item" v-for="item in order.items" :key="item.id">
            <image class="goods-image" :src="item.cover_image" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-title">{{ item.product_title }}</text>
              <text class="goods-sku" v-if="item.sku_name">{{ item.sku_name }}</text>
            </view>
            <view class="goods-right">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-count">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <view class="order-info">
            <text class="order-time">{{ formatTime(order.created_at) }}</text>
            <text class="order-count">共{{ order.items?.length }}件商品</text>
          </view>
          <view class="order-total">
            <text>合计:</text>
            <text class="total-price">¥{{ order.pay_amount }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="order-actions" @click.stop>
          <view class="action-btn secondary" @click="goDetail(order)">查看详情</view>
          <view class="action-btn primary" v-if="order.status === 'pending'" @click="goPay(order)">去支付</view>
          <view class="action-btn secondary" v-if="order.status === 'shipped'" @click="confirmReceive(order)">确认收货</view>
          <view class="action-btn danger" v-if="order.status === 'pending'" @click="cancelOrder(order)">取消订单</view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="orderList.length === 0 && !loading">
        <image src="/static/empty-order.png" mode="aspectFit" />
        <text>暂无相关订单</text>
      </view>

      <!-- 加载状态 -->
      <view class="load-more" v-if="orderList.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
        <text v-else @click="loadMore">加载更多</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { onShow } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import { checkLogin } from '@/utils/auth.js';

const currentTab = ref('');
const orderList = ref([]);
const loading = ref(false);
const noMore = ref(false);
const page = ref(1);
const pageSize = 10;

const tabs = ref([
  { label: '全部', value: '', count: 0 },
  { label: '待付款', value: 'pending', count: 0 },
  { label: '已付款', value: 'paid', count: 0 },
  { label: '已发货', value: 'shipped', count: 0 },
  { label: '已完成', value: 'completed', count: 0 }
]);

onLoad((options) => {
  if (options.status) {
    currentTab.value = options.status;
  }
});

onShow(() => {
  if (!checkLogin()) {
    orderList.value = [];
    tabs.value.forEach(tab => tab.count = 0);
    return;
  }
  resetData();
  loadData();
  loadOrderCount();
});

function resetData() {
  page.value = 1;
  noMore.value = false;
  orderList.value = [];
}

async function loadData(append = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    const params = {
      page: page.value,
      pageSize,
      status: currentTab.value
    };
    const res = await request.get('/order/list', params);
    const list = res?.list || [];
    
    if (append) {
      orderList.value = [...orderList.value, ...list];
    } else {
      orderList.value = list;
    }

    if (list.length < pageSize) {
      noMore.value = true;
    }
  } catch (e) {
    console.error('加载订单失败', e);
  } finally {
    loading.value = false;
  }
}

async function loadOrderCount() {
  try {
    const res = await request.get('/order/count');
    tabs.value[1].count = res?.pending || 0;
    tabs.value[2].count = res?.paid || 0;
    tabs.value[3].count = res?.shipped || 0;
  } catch (e) {
    console.error('加载订单数量失败', e);
  }
}

function onTabChange(value) {
  currentTab.value = value;
  resetData();
  loadData();
}

function loadMore() {
  if (noMore.value || loading.value) return;
  page.value++;
  loadData(true);
}

function goDetail(order) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}` });
}

function goPay(order) {
  uni.navigateTo({ url: `/pages/order/detail?id=${order.id}&action=pay` });
}

async function confirmReceive(order) {
  uni.showModal({
    title: '确认收货',
    content: '确认已收到商品？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.put(`/order/${order.id}/confirm`);
          uni.showToast({ title: '确认收货成功', icon: 'success' });
          loadData();
          loadOrderCount();
        } catch (e) {
          console.error('确认收货失败', e);
        }
      }
    }
  });
}

async function cancelOrder(order) {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.put(`/order/${order.id}/cancel`, { reason: '用户取消' });
          uni.showToast({ title: '订单已取消', icon: 'success' });
          loadData();
          loadOrderCount();
        } catch (e) {
          console.error('取消订单失败', e);
        }
      }
    }
  });
}

function getStatusText(status) {
  const map = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  };
  return map[status] || status;
}

function formatTime(time) {
  if (!time) return '';
  const date = new Date(time);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
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
  padding: 0 20rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  position: relative;
  
  text {
    font-size: 28rpx;
    color: #666;
  }
  
  &.active text {
    color: #ff4a8d;
    font-weight: bold;
  }
  
  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50rpx;
    height: 4rpx;
    background: #ff4a8d;
    border-radius: 2rpx;
  }
}

.tab-badge {
  position: absolute;
  top: 12rpx;
  right: 20%;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background: #ff4a8d;
  color: #fff;
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-list {
  padding: 20rpx;
}

.order-item {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-no {
  font-size: 24rpx;
  color: #666;
}

.order-status {
  font-size: 26rpx;
  
  &.pending { color: #ff9500; }
  &.paid { color: #409eff; }
  &.shipped { color: #409eff; }
  &.completed { color: #67c23a; }
  &.cancelled { color: #999; }
  &.refunded { color: #f56c6c; }
}

.goods-list {
  padding: 20rpx 24rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.goods-info {
  flex: 1;
  margin-left: 20rpx;
}

.goods-title {
  font-size: 28rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-sku {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.goods-right {
  text-align: right;
  margin-left: 20rpx;
}

.goods-price {
  display: block;
  font-size: 28rpx;
  color: #333;
}

.goods-count {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f5f5f5;
}

.order-info {
  display: flex;
  flex-direction: column;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-count {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.order-total {
  display: flex;
  align-items: baseline;
  font-size: 26rpx;
  color: #333;
  
  .total-price {
    font-size: 32rpx;
    font-weight: bold;
    color: #ff4a8d;
    margin-left: 8rpx;
  }
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f5f5f5;
}

.action-btn {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  
  &.primary {
    background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
    color: #fff;
  }
  
  &.secondary {
    background: #f5f5f5;
    color: #666;
  }
  
  &.danger {
    background: #fff;
    color: #f56c6c;
    border: 1rpx solid #f56c6c;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  
  image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }
  
  text {
    font-size: 28rpx;
    color: #999;
  }
}

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
