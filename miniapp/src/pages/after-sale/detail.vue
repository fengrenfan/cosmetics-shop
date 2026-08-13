<template>
  <view class="page">
    <!-- 状态头部 -->
    <view class="status-header" :class="detail.status">
      <text class="status-text">{{ getStatusText(detail.status) }}</text>
      <text class="status-desc">{{ getStatusDesc(detail.status) }}</text>
    </view>

    <!-- 售后信息 -->
    <view class="info-card">
      <view class="info-row">
        <text class="label">售后单号</text>
        <text class="value">{{ detail.refund_no }}</text>
      </view>
      <view class="info-row">
        <text class="label">退款类型</text>
        <text class="value">{{ detail.type === 'refund' ? '仅退款' : '退货退款' }}</text>
      </view>
      <view class="info-row">
        <text class="label">退款金额</text>
        <text class="value price">¥{{ detail.refund_amount }}</text>
      </view>
      <view class="info-row">
        <text class="label">退款原因</text>
        <text class="value">{{ detail.reason }}</text>
      </view>
      <view class="info-row" v-if="detail.description">
        <text class="label">补充说明</text>
        <text class="value">{{ detail.description }}</text>
      </view>
      <view class="info-row">
        <text class="label">申请时间</text>
        <text class="value">{{ formatTime(detail.created_at) }}</text>
      </view>
    </view>

    <!-- 凭证图片 -->
    <view class="info-card" v-if="detail.images && detail.images.length > 0">
      <text class="card-title">凭证图片</text>
      <view class="image-list">
        <image v-for="(img, idx) in detail.images" :key="idx" :src="img" mode="aspectFill"
          @click="previewImage(idx)" />
      </view>
    </view>

    <!-- 商家回复 -->
    <view class="info-card" v-if="detail.admin_remark">
      <text class="card-title">商家回复</text>
      <text class="reply-content">{{ detail.admin_remark }}</text>
      <text class="reply-time" v-if="detail.process_time">{{ formatTime(detail.process_time) }}</text>
    </view>

    <!-- 操作按钮 -->
    <view class="bottom-bar" v-if="detail.status === 'pending'">
      <view class="action-btn danger" @click="cancelAfterSale">撤销申请</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const detail = ref({});
const id = ref(null);

onLoad((options) => {
  id.value = options.id;
  loadDetail();
});

async function loadDetail() {
  try {
    const token = uni.getStorageSync('token');
    const res = await uni.request({
      url: '/api/after-sales/' + id.value,
      header: { Authorization: 'Bearer ' + token },
    });
    detail.value = res.data?.data || {};
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
}

async function cancelAfterSale() {
  uni.showModal({
    title: '撤销申请',
    content: '确定要撤销该售后申请吗？',
    success: async (res) => {
      if (res.confirm) {
        // 暂时没有撤销接口，提示用户联系客服
        uni.showToast({ title: '请联系客服处理', icon: 'none' });
      }
    }
  });
}

function previewImage(idx) {
  uni.previewImage({ urls: detail.value.images, current: idx });
}

function getStatusText(status) {
  const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝', refunding: '退款中', refunded: '已退款' };
  return map[status] || status;
}

function getStatusDesc(status) {
  const map = {
    pending: '商家将在48小时内处理',
    approved: '退款申请已通过，等待退款',
    rejected: '退款申请未通过',
    refunding: '退款正在处理中',
    refunded: '退款已原路返回',
  };
  return map[status] || '';
}

function formatTime(t) {
  if (!t) return '';
  return new Date(t).toLocaleString('zh-CN');
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; padding-bottom: 120rpx; }
.status-header { padding: 40rpx 30rpx; color: #fff; }
.status-header.pending { background: linear-gradient(135deg, #ff9500, #ffb347); }
.status-header.approved, .status-header.refunding { background: linear-gradient(135deg, #409eff, #6ab7ff); }
.status-header.rejected { background: linear-gradient(135deg, #999, #bbb); }
.status-header.refunded { background: linear-gradient(135deg, #67c23a, #8bd46c); }
.status-text { font-size: 36rpx; font-weight: bold; display: block; margin-bottom: 8rpx; }
.status-desc { font-size: 24rpx; opacity: 0.8; }
.info-card { background: #fff; margin: 20rpx; border-radius: 12rpx; padding: 24rpx; }
.card-title { font-size: 28rpx; font-weight: 600; color: #333; display: block; margin-bottom: 16rpx; }
.info-row { display: flex; justify-content: space-between; padding: 12rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.info-row:last-child { border-bottom: none; }
.label { font-size: 26rpx; color: #999; }
.value { font-size: 26rpx; color: #333; max-width: 60%; text-align: right; }
.value.price { color: #bb0004; font-weight: 600; font-size: 28rpx; }
.image-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-list image { width: 160rpx; height: 160rpx; border-radius: 8rpx; }
.reply-content { font-size: 26rpx; color: #333; line-height: 1.6; display: block; }
.reply-time { font-size: 22rpx; color: #999; display: block; margin-top: 12rpx; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx 30rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); }
.action-btn { text-align: center; padding: 24rpx; border-radius: 12rpx; font-size: 28rpx; }
.action-btn.danger { background: #fff; color: #f56c6c; border: 1rpx solid #f56c6c; }
</style>
