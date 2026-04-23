<template>
  <view class="page">
    <view class="header">
      <text class="title">浏览历史</text>
      <text class="clear-btn" @click="clearHistory" v-if="list.length > 0">清空</text>
    </view>

    <view class="list" v-if="list.length > 0">
      <view class="item" v-for="item in list" :key="item.id" @click="goProduct(item.product_id)">
        <image class="cover" :src="item.product?.cover_image || item.product?.images?.[0] || '/static/default-product.png'" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ item.product?.title || '商品已下架' }}</text>
          <view class="bottom">
            <text class="price">¥{{ item.product?.price || '0.00' }}</text>
            <text class="time">{{ formatTime(item.viewed_at) }}</text>
          </view>
        </view>
        <text class="iconfont fa-trash-o delete-btn" @click.stop="deleteItem(item.product_id)"></text>
      </view>
    </view>

    <view class="empty" v-else>
      <text class="iconfont fa-clock-rotate-left"></text>
      <text class="empty-text">暂无浏览记录</text>
      <view class="go-shop" @click="goIndex">去逛逛</view>
    </view>

    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '@/utils/request.js';

const list = ref([]);
const loading = ref(false);

onShow(() => {
  loadList();
});

async function loadList() {
  loading.value = true;
  try {
    const res = await request.get('/browse-history/list');
    list.value = res?.list || [];
  } catch (e) {
    console.error('加载浏览历史失败', e);
  } finally {
    loading.value = false;
  }
}

async function clearHistory() {
  uni.showModal({
    title: '提示',
    content: '确定要清空所有浏览记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.delete('/browse-history/clear');
          list.value = [];
          uni.showToast({ title: '已清空', icon: 'success' });
        } catch (e) {
          uni.showToast({ title: '清空失败', icon: 'none' });
        }
      }
    }
  });
}

async function deleteItem(productId) {
  try {
    await request.delete(`/browse-history/delete?product_id=${productId}`);
    list.value = list.value.filter(item => item.product_id != productId);
    uni.showToast({ title: '已删除', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '删除失败', icon: 'none' });
  }
}

function goProduct(productId) {
  uni.navigateTo({ url: `/pages/product/detail?id=${productId}` });
}

function goIndex() {
  uni.switchTab({ url: '/pages/index/index' });
}

function formatTime(time) {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  return `${date.getMonth() + 1}-${date.getDate()}`;
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: #fff;

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .clear-btn {
    font-size: 26rpx;
    color: #ff4a8d;
  }
}

.list {
  .item {
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    background: #fff;
    margin-top: 2rpx;

    .cover {
      width: 180rpx;
      height: 180rpx;
      border-radius: 12rpx;
      background: #f5f5f5;
      flex-shrink: 0;
    }

    .info {
      flex: 1;
      margin-left: 24rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 180rpx;

      .name {
        font-size: 28rpx;
        color: #333;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .price {
          font-size: 32rpx;
          color: #ff4a8d;
          font-weight: bold;
        }

        .time {
          font-size: 22rpx;
          color: #999;
        }
      }
    }

    .delete-btn {
      font-size: 40rpx;
      color: #ccc;
      padding: 20rpx;
      margin-right: -20rpx;
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .iconfont {
    font-size: 120rpx;
    color: #ddd;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 30rpx;
  }

  .go-shop {
    margin-top: 40rpx;
    padding: 20rpx 60rpx;
    background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
    color: #fff;
    font-size: 28rpx;
    border-radius: 50rpx;
  }
}

.loading {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
