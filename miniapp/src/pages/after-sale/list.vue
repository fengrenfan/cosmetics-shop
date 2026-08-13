<template>
  <view class="page">
    <view class="empty-state" v-if="afterSaleList.length === 0 && !loading">
      <text>暂无售后记录</text>
    </view>

    <view class="sale-item" v-for="item in afterSaleList" :key="item.id" @click="goDetail(item)">
      <view class="sale-header">
        <text class="sale-no">{{ item.refund_no }}</text>
        <text class="sale-status" :class="item.status">{{ getStatusText(item.status) }}</text>
      </view>
      <view class="sale-info">
        <text class="sale-type">{{ item.type === 'refund' ? '仅退款' : '退货退款' }}</text>
        <text class="sale-amount">¥{{ item.refund_amount }}</text>
      </view>
      <text class="sale-reason">{{ item.reason }}</text>
      <view class="sale-admin" v-if="item.admin_remark">
        <text class="admin-label">商家回复：</text>
        <text class="admin-text">{{ item.admin_remark }}</text>
      </view>
      <view class="sale-footer">
        <text class="sale-time">{{ formatTime(item.created_at) }}</text>
        <text class="sale-detail-btn">查看详情 ></text>
      </view>
    </view>

    <view class="load-more" v-if="afterSaleList.length > 0">
      <text v-if="loading">加载中...</text>
      <text v-else-if="noMore">没有更多了</text>
      <text v-else @click="loadMore">加载更多</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const afterSaleList = ref([]);
const loading = ref(false);
const noMore = ref(false);
const page = ref(1);

onMounted(() => {
  fetchList();
});

async function fetchList() {
  loading.value = true;
  try {
    const token = uni.getStorageSync('token');
    const res = await uni.request({
      url: '/api/after-sales/mine',
      data: { page: page.value, limit: 10 },
      header: { Authorization: 'Bearer ' + token },
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

function goDetail(item) {
  uni.navigateTo({ url: '/pages/after-sale/detail?id=' + item.id });
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
.sale-item { background: #fff; margin: 16rpx 24rpx; border-radius: 12rpx; padding: 24rpx; }
.sale-header { display: flex; justify-content: space-between; margin-bottom: 16rpx; }
.sale-no { font-size: 24rpx; color: #999; }
.sale-status { font-size: 24rpx; font-weight: 600; }
.sale-status.pending { color: #e6a23c; }
.sale-status.approved, .sale-status.refunding { color: #409eff; }
.sale-status.refunded { color: #67c23a; }
.sale-status.rejected { color: #f56c6c; }
.sale-info { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.sale-type { font-size: 26rpx; color: #333; }
.sale-amount { font-size: 28rpx; font-weight: 600; color: #bb0004; }
.sale-reason { font-size: 24rpx; color: #666; margin-bottom: 12rpx; }
.sale-admin { background: #f9f9f9; padding: 16rpx; border-radius: 8rpx; margin-bottom: 12rpx; }
.admin-label { font-size: 24rpx; color: #999; }
.admin-text { font-size: 24rpx; color: #333; }
.sale-footer { display: flex; justify-content: space-between; align-items: center; }
.sale-time { font-size: 22rpx; color: #999; }
.sale-detail-btn { font-size: 24rpx; color: #bb0004; }
.empty-state { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.load-more { text-align: center; padding: 24rpx; color: #999; font-size: 24rpx; }
</style>
