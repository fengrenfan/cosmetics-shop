<template>
  <view class="page">
    <!-- 收藏列表 -->
    <view class="goods-list" v-if="list.length > 0">
      <view 
        class="goods-item" 
        v-for="item in list" 
        :key="item.id"
      >
        <image class="goods-image" :src="item.cover_image" mode="aspectFill" @click="goDetail(item)" />
        <view class="goods-info">
          <text class="goods-title" @click="goDetail(item)">{{ item.title }}</text>
          <view class="goods-bottom">
            <text class="goods-price">¥{{ item.price }}</text>
            <view class="goods-actions">
              <view class="action-btn cart" @click="addToCart(item)">
                <text class="iconfont shopping_cart"></text>
              </view>
              <view class="action-btn delete" @click="removeFavorite(item)">
                <text class="iconfont delete"></text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && list.length === 0">
      <image src="/static/empty-favorite.png" mode="aspectFit" />
      <text class="empty-text">暂无收藏商品</text>
      <view class="empty-btn" @click="goShopping">去逛逛</view>
    </view>

    <!-- 加载状态 -->
    <view class="load-more" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '@/utils/request.js';
import { useCartStore } from '@/stores/cart.js';

const cartStore = useCartStore();

const list = ref([]);
const loading = ref(false);

onShow(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const res = await request.get('/favorite/list');
    list.value = (res || []).map(item => ({
      ...item,
      cover_image: request.fixImageUrl(item.cover_image)
    }));
  } catch (e) {
    console.error('加载收藏失败', e);
  } finally {
    loading.value = false;
  }
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.product_id}` });
}

function goShopping() {
  uni.switchTab({ url: '/pages/index/index' });
}

async function addToCart(item) {
  await cartStore.addItem({
    product_id: item.product_id,
    sku_id: item.sku_id || null,
    title: item.title,
    cover_image: item.cover_image,
    price: item.price,
    quantity: 1,
    stock: 999,
  });
}

async function removeFavorite(item) {
  uni.showModal({
    title: '提示',
    content: '确定要取消收藏吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.post('/favorite/toggle', { product_id: item.product_id });
          uni.showToast({ title: '已取消收藏', icon: 'success' });
          
          const index = list.value.findIndex(f => f.product_id === item.product_id);
          if (index > -1) {
            list.value.splice(index, 1);
          }
        } catch (e) {
          console.error('取消收藏失败', e);
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
  padding: 20rpx;
}

.goods-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.goods-item {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.goods-image {
  width: 100%;
  height: 340rpx;
  background: #f5f5f5;
}

.goods-info {
  padding: 20rpx;
}

.goods-title {
  font-size: 28rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.goods-price {
  font-size: 32rpx;
  color: #ff4a8d;
  font-weight: bold;
}

.goods-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  .iconfont {
    font-size: 24rpx;
  }
  
  &.cart {
    background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
    color: #fff;
  }
  
  &.delete {
    background: #f5f5f5;
    color: #999;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  
  image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
  }
  
  .empty-btn {
    padding: 20rpx 60rpx;
    background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
  }
}

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
