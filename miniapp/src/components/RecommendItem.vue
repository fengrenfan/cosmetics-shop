<template>
  <view class="rec-item" @click="$emit('go-detail')">
    <view class="rec-img-wrap">
      <image class="rec-img" :src="item.cover_image" mode="aspectFill" />
    </view>
    <view class="rec-info">
      <text class="rec-title">{{ item.title }}</text>
      <view class="rec-bottom">
        <view class="rec-price-wrap">
          <text class="price-symbol rec-symbol">¥</text>
          <text class="rec-price">{{ item.price }}</text>
        </view>
        <view class="rec-add-btn" @click.stop="$emit('add-cart')">
          <text class="iconfont fa-cart-plus rec-cart-icon"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
});

defineEmits(['go-detail', 'add-cart']);
</script>

<style lang="scss" scoped>
.rec-item {
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.97);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  }
}

.rec-img-wrap {
  height: 280rpx;
  overflow: hidden;
  background: #f5f3f3;
}

.rec-img {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;

  &:active {
    transform: scale(1.05);
  }
}

.rec-info {
  padding: 20rpx 24rpx 24rpx;
}

.rec-title {
  font-size: 26rpx;
  color: #1b1c1c;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
  margin-bottom: 16rpx;
}

.rec-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rec-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.rec-symbol {
  font-size: 20rpx;
}

.rec-price {
  font-size: 30rpx;
  font-weight: 800;
  color: #bb0004;
  font-family: 'Manrope', sans-serif;
}

.rec-add-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(#bb0004, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  .rec-cart-icon {
    font-size: 28rpx;
    color: #bb0004;
  }
}
</style>