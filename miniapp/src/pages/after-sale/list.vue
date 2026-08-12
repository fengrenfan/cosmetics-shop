<template>
  <view class="page">
    <!-- Tab 栏 -->
    <view class="tabs">
      <view class="tab-item" :class="{ active: currentTab === 'apply' }" @click="currentTab = 'apply'">申请售后</view>
      <view class="tab-item" :class="{ active: currentTab === 'list' }" @click="currentTab = 'list'; loadList()">售后记录</view>
    </view>

    <!-- 申请售后 -->
    <view v-if="currentTab === 'apply'">
      <view class="empty-state" v-if="refundableOrders.length === 0 && !loading">
        <text>暂无可申请售后的订单</text>
      </view>
      <view class="order-item" v-for="order in refundableOrders" :key="order.id" @click="goApply(order)">
        <view class="order-header">
          <text class="order-no">{{ order.order_no }}</text>
          <text class="order-amount">¥{{ order.pay_amount }}</text>
        </view>
        <view class="order-items">
          <view class="item" v-for="item in order.items" :key="item.id">
            <image class="item-img" :src="item.cover_image" mode="aspectFill"></image>
            <text class="item-title">{{ item.product_title }}</text>
          </view>
        </view>
        <view class="order-footer">
          <text class="order-time">{{ formatTime(order.created_at) }}</text>
          <text class="apply-btn">申请售后</text>
        </view>
      </view>
    </view>

    <!-- 售后记录 -->
    <view v-if="currentTab === 'list'">
      <view class="empty-state" v-if="afterSaleList.length === 0 && !loading">
        <text>暂无售后记录</text>
      </view>
      <view class="sale-item" v-for="item in afterSaleList" :key="item.id">
        <view class="sale-header">
          <text class="sale-no">{{ item.refund_no }}</text>
          <text class="sale-status" :class="item.status">{{ getStatusText(item.status) }}</text>
        </view>
        <view class="sale-info">
          <text class="sale-type">{{ item.type === 'refund' ? '仅退款' : '退货退款' }}</text>
          <text class="sale-amount">¥{{ item.refund_amount }}</text>
        </view>
        <text class="sale-reason">{{ item.reason }}</text>
        <text class="sale-time">{{ formatTime(item.created_at) }}</text>
        <view class="sale-admin" v-if="item.admin_remark">
          <text>商家回复: {{ item.admin_remark }}</text>
        </view>
      </view>

      <view class="load-more" v-if="afterSaleList.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
        <text v-else @click="loadMore">加载更多</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentTab = ref('apply');
const refundableOrders = ref([]);
const afterSaleList = ref([]);
const loading = ref(false);
const noMore = ref(false);
const page = ref(1);

onMounted(() => {
  loadRefundableOrders();
});

async function loadRefundableOrders() {
  loading.value = true;
  try {
    const token = uni.getStorageSync('token');
    const res = await uni.request({
      url: '/api/after-sales/refundable',
      header: { Authorization: `Bearer ${token}` },
    });
    refundableOrders.value = res.data?.data || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function loadList() {
  page.value = 1;
  afterSaleList.value = [];
  noMore.value = false;
  await fetchList();
}

async function fetchList() {
  loading.value = true;
  try {
    const token = uni.getStorageSync('token');
    const res = await uni.request({
      url: '/api/after-sales/mine',
      data: { page: page.value, limit: 10 },
      header: { Authorization: `Bearer ${token}` },
    });
    const data = res.data?.data || {};
    if (page.value === 1) {
      afterSaleList.value = data.list || [];
    } else {
      afterSaleList.value.push(...(data.list || []));
    }
    if ((data.list || []).length < 10) noMore.value = true;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (noMore.value || loading.value) return;
  page.value++;
  fetchList();
}

function goApply(order) {
  uni.navigateTo({ url: `/pages/after-sale/apply?orderId=${order.id}&amount=${order.pay_amount}` });
}

function getStatusText(status) {
  const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝', refunding: '退款中', refunded: '已退款' };
  return map[status] || status;
}

function formatTime(t) {
  if (!t) return '';
  return new Date(t).toLocaleString('zh-CN');
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; }
.tabs { display: flex; background: #fff; border-bottom: 1rpx solid #f0f0f0; }
.tab-item { flex: 1; text-align: center; padding: 24rpx; font-size: 28rpx; color: #666; }
.tab-item.active { color: #bb0004; border-bottom: 4rpx solid #bb0004; font-weight: 600; }
.order-item, .sale-item { background: #fff; margin: 16rpx 24rpx; border-radius: 12rpx; padding: 24rpx; }
.order-header, .sale-header { display: flex; justify-content: space-between; margin-bottom: 16rpx; }
.order-no, .sale-no { font-size: 24rpx; color: #999; }
.order-amount { font-size: 28rpx; font-weight: 600; color: #333; }
.order-items { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.item { display: flex; align-items: center; gap: 12rpx; }
.item-img { width: 80rpx; height: 80rpx; border-radius: 8rpx; }
.item-title { font-size: 24rpx; color: #333; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.order-footer { display: flex; justify-content: space-between; align-items: center; }
.order-time, .sale-time { font-size: 22rpx; color: #999; }
.apply-btn { font-size: 24rpx; color: #bb0004; padding: 8rpx 24rpx; border: 1rpx solid #bb0004; border-radius: 24rpx; }
.sale-status { font-size: 24rpx; font-weight: 600; }
.sale-status.pending { color: #e6a23c; }
.sale-status.approved, .sale-status.refunded { color: #67c23a; }
.sale-status.rejected { color: #f56c6c; }
.sale-info { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.sale-type { font-size: 26rpx; color: #333; }
.sale-amount { font-size: 28rpx; font-weight: 600; color: #bb0004; }
.sale-reason { font-size: 24rpx; color: #666; margin-bottom: 8rpx; }
.sale-admin { background: #f9f9f9; padding: 12rpx; border-radius: 8rpx; margin-top: 12rpx; }
.sale-admin text { font-size: 24rpx; color: #666; }
.empty-state { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.load-more { text-align: center; padding: 24rpx; color: #999; font-size: 24rpx; }
</style>
