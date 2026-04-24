<template>
  <view class="page">
    <view class="header">
      <text class="points-num">{{ userPoints }}</text>
      <text class="points-label">可用积分</text>
    </view>

    <view class="logs-list">
      <view class="log-item" v-for="item in logs" :key="item.id">
        <view class="log-left">
          <text class="log-type">{{ getTypeName(item.type) }}</text>
          <text class="log-time">{{ formatTime(item.created_at) }}</text>
        </view>
        <view class="log-right">
          <text class="log-points" :class="{ income: item.type === 1 }">
            {{ item.type === 1 ? '+' : '-' }}{{ item.points }}
          </text>
          <text class="log-balance">余额: {{ item.balance }}</text>
        </view>
      </view>

      <view class="empty" v-if="logs.length === 0 && !loading">
        <text>暂无积分记录</text>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '@/utils/request.js';

const userPoints = ref(0);
const logs = ref([]);
const loading = ref(false);
const page = ref(1);
const noMore = ref(false);

onShow(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const [pointsRes, logsRes] = await Promise.all([
      request.get('/points'),
      request.get('/points/logs', { page: page.value }),
    ]);
    userPoints.value = pointsRes.points || 0;
    logs.value = logsRes.list || [];
  } catch (e) {
    console.error('加载积分数据失败', e);
  } finally {
    loading.value = false;
  }
}

function getTypeName(type) {
  const map = { 1: '收入', 2: '支出', 3: '过期' };
  return map[type] || '未知';
}

function formatTime(time) {
  if (!time) return '';
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f5f5f5; }
.header {
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  color: #fff;
  padding: 60rpx 32rpx;
  text-align: center;
}
.points-num { font-size: 64rpx; font-weight: bold; }
.points-label { font-size: 24rpx; opacity: 0.8; }
.logs-list { padding: 20rpx; }
.log-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}
.log-left { display: flex; flex-direction: column; }
.log-type { font-size: 28rpx; color: #333; }
.log-time { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.log-right { display: flex; flex-direction: column; align-items: flex-end; }
.log-points { font-size: 32rpx; font-weight: bold; color: #ff4a8d; }
.log-points.income { color: #52c41a; }
.log-balance { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.empty, .loading { text-align: center; padding: 60rpx; color: #999; }
</style>
