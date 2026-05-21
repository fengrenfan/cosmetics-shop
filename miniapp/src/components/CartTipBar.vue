<template>
  <view class="tip-bar">
    <text class="tip-count">购物车 ({{ itemCount }})</text>
    <view class="tip-right" v-if="hasInvalid">
      <view class="tip-cleanup" @click="$emit('clear-invalid')">
        <uni-icons type="trash" size="16" color="#bb0004"></uni-icons>
        <text>清理失效商品</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  itemCount: {
    type: Number,
    default: 0,
  },
  hasInvalid: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['clear-invalid']);
</script>

<style lang="scss" scoped>
.tip-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f3f3;
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 24rpx;
}

.tip-count {
  font-family: 'Manrope', sans-serif;
  font-size: 30rpx;
  font-weight: 800;
  color: #bb0004;
}

.tip-right {
  display: flex;
  align-items: center;
}

.tip-cleanup {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: rgba(#bb0004, 0.1);
  font-size: 22rpx;
  color: #bb0004;
  padding: 8rpx 24rpx;
  border-radius: 9999rpx;
  font-weight: 500;

  .fa-trash-alt {
    font-size: 20rpx;
  }
}
</style>