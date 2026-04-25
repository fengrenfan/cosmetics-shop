<template>
  <view class="page">
    <!-- 订单状态 -->
    <view class="status-section" :class="order.status">
      <text class="status-icon iconfont" :class="getStatusIcon(order.status)"></text>
      <text class="status-text">{{ getStatusText(order.status) }}</text>
      <text class="status-desc">{{ getStatusDesc(order.status) }}</text>
    </view>

    <!-- 收货信息 -->
    <view class="address-section" v-if="order.address_snapshot">
      <view class="address-content">
        <view class="address-info">
          <text class="address-name">{{ order.address_snapshot.name }}</text>
          <text class="address-phone">{{ order.address_snapshot.phone }}</text>
        </view>
        <view class="address-detail">
          {{ order.address_snapshot.province }}{{ order.address_snapshot.city }}{{ order.address_snapshot.district }}{{ order.address_snapshot.detail_address }}
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="goods-item" v-for="item in order.items" :key="item.id">
        <image class="goods-image" :src="item.cover_image" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-title">{{ item.product_title }}</text>
          <text class="goods-sku" v-if="item.sku_name">{{ item.sku_name }}</text>
          <view class="goods-bottom">
            <text class="goods-price">¥{{ item.price }}</text>
            <text class="goods-count">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="info-section">
      <view class="info-row">
        <text class="info-label">订单编号</text>
        <view class="info-value">
          <text>{{ order.order_no }}</text>
          <text class="copy-btn" @click="copyOrderNo">复制</text>
        </view>
      </view>
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ formatTime(order.created_at) }}</text>
      </view>
      <view class="info-row" v-if="order.pay_time">
        <text class="info-label">支付时间</text>
        <text class="info-value">{{ formatTime(order.pay_time) }}</text>
      </view>
      <view class="info-row" v-if="order.ship_time">
        <text class="info-label">发货时间</text>
        <text class="info-value">{{ formatTime(order.ship_time) }}</text>
      </view>
      <view class="info-row" v-if="order.complete_time">
        <text class="info-label">完成时间</text>
        <text class="info-value">{{ formatTime(order.complete_time) }}</text>
      </view>
      <view class="info-row" v-if="order.express_company">
        <text class="info-label">物流公司</text>
        <text class="info-value">{{ order.express_company }}</text>
      </view>
      <view class="info-row" v-if="order.express_no">
        <text class="info-label">快递单号</text>
        <view class="info-value">
          <text>{{ order.express_no }}</text>
          <text class="copy-btn" @click="copyExpressNo">复制</text>
        </view>
      </view>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-row">
        <text class="price-label">商品总价</text>
        <text class="price-value">¥{{ order.total_amount }}</text>
      </view>
      <view class="price-row">
        <text class="price-label">运费</text>
        <text class="price-value">{{ order.freight_amount > 0 ? `+¥${order.freight_amount}` : '¥0' }}</text>
      </view>
      <view class="price-row" v-if="order.coupon_amount > 0">
        <text class="price-label">优惠券</text>
        <text class="price-value discount">-¥{{ order.coupon_amount }}</text>
      </view>
      <view class="price-row total">
        <text class="price-label">实付金额</text>
        <text class="price-value">¥{{ order.pay_amount }}</text>
      </view>
    </view>

    <!-- 备注 -->
    <view class="remark-section" v-if="order.remark">
      <text class="remark-label">订单备注</text>
      <text class="remark-content">{{ order.remark }}</text>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="showActions">
      <view class="action-btn secondary" @click="goHome" v-if="order.status === 'completed'">返回首页</view>
      <view class="action-btn danger" @click="cancelOrder" v-if="order.status === 'pending'">取消订单</view>
      <view class="action-btn primary" @click="goPay" v-if="order.status === 'pending'">去支付</view>
      <view class="action-btn secondary" @click="confirmReceive" v-if="order.status === 'shipped'">确认收货</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import request from '@/utils/request.js';

const order = ref({});
const loading = ref(false);
const paying = ref(false);

const orderId = ref(null);

onLoad((options) => {
  orderId.value = options.id;
  if (orderId.value) {
    loadOrderDetail();
  }
});

async function loadOrderDetail() {
  loading.value = true;
  try {
    const data = await request.get(`/order/${orderId.value}`);
    order.value = data;
  } catch (e) {
    console.error('加载订单详情失败', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

const showActions = computed(() => {
  return ['pending', 'shipped', 'completed'].includes(order.value.status);
});

function getStatusIcon(status) {
  const map = {
    pending: 'fa-wallet',
    paid: 'fa-plane',
    shipped: 'fa-truck',
    completed: 'fa-circle-check',
    cancelled: 'fa-xmark',
    refunded: 'fa-rotate-left'
  };
  return map[status] || 'fa-wallet';
}

function getStatusText(status) {
  const map = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '订单已完成',
    cancelled: '订单已取消',
    refunded: '已退款'
  };
  return map[status] || status;
}

function getStatusDesc(status) {
  const map = {
    pending: '请尽快完成支付',
    paid: '商家正在备货中',
    shipped: '商品已发货，请注意查收',
    completed: '感谢您的购买',
    cancelled: '订单已关闭',
    refunded: '退款已原路返回'
  };
  return map[status] || '';
}

function formatTime(time) {
  if (!time) return '-';
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function copyOrderNo() {
  uni.setClipboardData({
    data: order.value.order_no,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' });
    }
  });
}

function copyExpressNo() {
  uni.setClipboardData({
    data: order.value.express_no,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' });
    }
  });
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' });
}

function goPay() {
  if (paying.value) return;

  const channels = [
    { id: 'wechat', label: '微信支付' },
    { id: 'alipay', label: '支付宝支付' },
  ];

  uni.showActionSheet({
    itemList: channels.map(c => c.label),
    success: async ({ tapIndex }) => {
      const selected = channels[tapIndex];
      if (!selected) return;
      await startPay(selected.id);
    },
  });
}

async function startPay(payChannel) {
  paying.value = true;
  try {
    const payScene = process.env.UNI_PLATFORM === 'h5' ? 'h5' : 'miniapp';
    const payOrder = await request.post('/payment/create', {
      order_id: Number(orderId.value),
      pay_channel: payChannel,
      pay_scene: payScene,
    });

    if (payScene === 'miniapp') {
      await mockMiniappPay(payOrder?.pay_params || {});
    } else {
      await mockH5Pay(payOrder?.pay_params || {}, payChannel);
    }

    await request.post('/payment/mock/success', {
      out_trade_no: payOrder.out_trade_no,
      pay_channel: payChannel,
    });

    uni.showToast({ title: '支付成功', icon: 'success' });
    await pollPayStatus();
  } catch (e) {
    console.error('支付失败', e);
    uni.showToast({ title: e?.message || '支付失败', icon: 'none' });
  } finally {
    paying.value = false;
  }
}

function mockMiniappPay(params) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!params?.out_trade_no) {
        reject(new Error('支付参数异常'));
        return;
      }
      resolve(true);
    }, 400);
  });
}

function mockH5Pay(params, payChannel) {
  return new Promise((resolve, reject) => {
    if (payChannel === 'wechat' && !params?.mweb_url) {
      reject(new Error('微信H5支付参数异常'));
      return;
    }
    if (payChannel === 'alipay' && !params?.form_url) {
      reject(new Error('支付宝H5支付参数异常'));
      return;
    }
    setTimeout(() => resolve(true), 400);
  });
}

async function pollPayStatus() {
  for (let i = 0; i < 3; i++) {
    const statusRes = await request.get(`/payment/status/${orderId.value}`);
    if (statusRes?.pay_status === 'paid' || statusRes?.status === 'paid') {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  await loadOrderDetail();
}

async function cancelOrder() {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.put(`/order/${orderId.value}/cancel`, { reason: '用户取消' });
          uni.showToast({ title: '订单已取消', icon: 'success' });
          loadOrderDetail();
        } catch (e) {
          console.error('取消订单失败', e);
        }
      }
    }
  });
}

async function confirmReceive() {
  uni.showModal({
    title: '确认收货',
    content: '确认已收到商品？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.put(`/order/${orderId.value}/confirm`);
          uni.showToast({ title: '确认收货成功', icon: 'success' });
          loadOrderDetail();
        } catch (e) {
          console.error('确认收货失败', e);
        }
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  
  &.pending {
    background: linear-gradient(135deg, #ff9500 0%, #ffb347 100%);
    color: #fff;
  }
  
  &.paid {
    background: linear-gradient(135deg, #409eff 0%, #6ab7ff 100%);
    color: #fff;
  }
  
  &.shipped {
    background: linear-gradient(135deg, #409eff 0%, #6ab7ff 100%);
    color: #fff;
  }
  
  &.completed {
    background: linear-gradient(135deg, #67c23a 0%, #8bd46c 100%);
    color: #fff;
  }
  
  &.cancelled,
  &.refunded {
    background: #999;
    color: #fff;
  }
}

.status-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.status-desc {
  font-size: 24rpx;
  opacity: 0.8;
}

.address-section {
  margin: 20rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
}

.address-content {
  display: flex;
  flex-direction: column;
}

.address-info {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.address-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 20rpx;
}

.address-phone {
  font-size: 28rpx;
  color: #666;
}

.address-detail {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

.goods-section {
  margin: 0 20rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.goods-item {
  display: flex;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
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

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.goods-price {
  font-size: 30rpx;
  color: #ff4a8d;
  font-weight: bold;
}

.goods-count {
  font-size: 24rpx;
  color: #999;
}

.info-section {
  margin: 20rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 26rpx;
  color: #999;
}

.info-value {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #333;
}

.copy-btn {
  margin-left: 16rpx;
  padding: 4rpx 16rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 22rpx;
  border-radius: 4rpx;
}

.price-section {
  margin: 20rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  
  &.total {
    padding-top: 20rpx;
    margin-top: 10rpx;
    border-top: 1rpx solid #f5f5f5;
    
    .price-value {
      font-size: 36rpx;
      font-weight: bold;
      color: #ff4a8d;
    }
  }
}

.price-label {
  font-size: 26rpx;
  color: #666;
}

.price-value {
  font-size: 26rpx;
  color: #333;
  
  &.discount {
    color: #67c23a;
  }
}

.remark-section {
  margin: 20rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
}

.remark-label {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.remark-content {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

.bottom-placeholder {
  height: 120rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  padding: 0 30rpx;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  padding: 0 40rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  
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
</style>
