<template>
  <view class="page">
    <view class="empty-state" v-if="notifications.length === 0 && !loading">
      <text>暂无通知</text>
    </view>

    <view class="notif-item" :class="{ unread: item.is_read === 0 }" v-for="item in notifications" :key="item.id" @click="readNotif(item)">
      <view class="notif-icon" :class="item.type">
        <uni-icons :type="getIcon(item.type)" size="20" color="#fff"></uni-icons>
      </view>
      <view class="notif-content">
        <text class="notif-title">{{ item.title }}</text>
        <text class="notif-desc">{{ item.content }}</text>
        <text class="notif-time">{{ formatTime(item.created_at) }}</text>
      </view>
    </view>

    <view class="load-more" v-if="notifications.length > 0">
      <text v-if="loading">加载中...</text>
      <text v-else-if="noMore">没有更多了</text>
      <text v-else @click="loadMore">加载更多</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const notifications = ref([]);
const loading = ref(false);
const noMore = ref(false);
const page = ref(1);

onMounted(() => {
  fetchList();
  markAllRead();
});

async function fetchList() {
  loading.value = true;
  try {
    const token = uni.getStorageSync('token');
    const res = await uni.request({
      url: '/api/notifications',
      data: { page: page.value, limit: 20 },
      header: { Authorization: `Bearer ${token}` },
    });
    const data = res.data?.data || {};
    if (page.value === 1) {
      notifications.value = data.list || [];
    } else {
      notifications.value.push(...(data.list || []));
    }
    if ((data.list || []).length < 20) noMore.value = true;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function markAllRead() {
  try {
    const token = uni.getStorageSync('token');
    await uni.request({
      url: '/api/notifications/read-all',
      method: 'PUT',
      header: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {}
}

async function readNotif(item) {
  if (item.is_read === 0) {
    item.is_read = 1;
    try {
      const token = uni.getStorageSync('token');
      await uni.request({
        url: `/api/notifications/${item.id}/read`,
        method: 'PUT',
        header: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {}
  }
  // 跳转到相关页面
  if (item.ref_type === 'order' && item.ref_id) {
    uni.navigateTo({ url: `/pages/order/detail?id=${item.ref_id}` });
  }
}

function loadMore() {
  if (noMore.value || loading.value) return;
  page.value++;
  fetchList();
}

function getIcon(type) {
  if (type?.includes('order')) return 'cart-filled';
  if (type?.includes('after_sale')) return 'redo';
  if (type?.includes('review')) return 'chat';
  return 'bell';
}

function formatTime(t) {
  if (!t) return '';
  return new Date(t).toLocaleString('zh-CN');
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; }
.notif-item { display: flex; gap: 20rpx; background: #fff; padding: 24rpx; margin-bottom: 2rpx; }
.notif-item.unread { background: #fffbe6; }
.notif-icon { width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notif-icon.order_paid, .notif-icon.order_shipped, .notif-icon.order_completed { background: #409eff; }
.notif-icon.after_sale_approved, .notif-icon.after_sale_refunded { background: #67c23a; }
.notif-icon.after_sale_rejected { background: #f56c6c; }
.notif-icon.system { background: #909399; }
.notif-content { flex: 1; }
.notif-title { font-size: 28rpx; font-weight: 600; color: #333; display: block; margin-bottom: 8rpx; }
.notif-desc { font-size: 24rpx; color: #666; display: block; margin-bottom: 8rpx; }
.notif-time { font-size: 22rpx; color: #999; }
.empty-state { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.load-more { text-align: center; padding: 24rpx; color: #999; font-size: 24rpx; }
</style>
