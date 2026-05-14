<template>
  <view class="shipping-bar">
    <text class="shipping-text" :class="{ done: !showGap }">
      {{ showGap ? `还差 ¥${gap.toFixed(2)} 免运费` : `已满 ¥99，免运费` }}
    </text>
    <view class="bar-track" v-if="showGap">
      <view class="bar-fill" :style="{ width: fillPercent + '%' }"></view>
    </view>
    <uni-icons type="checkbox-filled" size="12" color="#52c41a" class="check-icon" v-if="!showGap"></uni-icons>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  totalPrice: {
    type: Number,
    default: 0,
  },
  threshold: {
    type: Number,
    default: 99,
  },
});

const gap = computed(() => Math.max(0, props.threshold - props.totalPrice));
const showGap = computed(() => gap.value > 0);
const fillPercent = computed(() => Math.min(100, (props.threshold - gap.value) / props.threshold * 100));
</script>

<style lang="scss" scoped>
.shipping-bar {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 4rpx;
}

.shipping-text {
  font-size: 20rpx;
  color: #5d3f3b;
  font-weight: 500;

  &.done {
    color: #52c41a;
  }
}

.bar-track {
  width: 120rpx;
  height: 6rpx;
  background: #e9e8e7;
  border-radius: 9999rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #bb0004 0%, #e1251b 100%);
  border-radius: 9999rpx;
  transition: width 0.3s ease;
}

.check-icon {
  font-size: 24rpx;
  color: #52c41a;
}
</style>