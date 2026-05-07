<template>
  <view class="recommend-section">
    <view class="recommend-header">
      <view class="divider-line"></view>
      <view class="recommend-title">
        <text class="iconfont fa-heart heart-icon"></text>
        <text>猜你喜欢</text>
      </view>
      <view class="divider-line"></view>
    </view>
    <view class="recommend-grid">
      <RecommendItem
        v-for="item in list"
        :key="item.id"
        :item="item"
        @go-detail="$emit('go-detail', item)"
        @add-cart="$emit('add-cart', item)"
      />
    </view>
  </view>
</template>

<script setup>
import RecommendItem from './RecommendItem.vue';

defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['go-detail', 'add-cart']);
</script>

<style lang="scss" scoped>
.recommend-section {
  margin-top: 64rpx;
  padding-bottom: 40rpx;
}

.recommend-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 36rpx;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: #e7bdb7;
}

.recommend-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-family: 'Manrope', sans-serif;
  font-size: 32rpx;
  font-weight: 800;
  color: #1b1c1c;
  white-space: nowrap;
}

.heart-icon {
  font-size: 32rpx;
  color: #bb0004;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}
</style>