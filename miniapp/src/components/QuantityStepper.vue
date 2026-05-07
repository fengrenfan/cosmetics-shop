<template>
  <view class="qty-stepper">
    <view class="qty-btn qty-minus" @click.stop="handleMinus">
      <text class="qty-icon">−</text>
    </view>
    <text class="qty-num">{{ quantity }}</text>
    <view class="qty-btn qty-plus" @click.stop="handlePlus">
      <text class="qty-icon">+</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  quantity: {
    type: Number,
    default: 1,
  },
  min: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(['change', 'minus', 'plus']);

function handleMinus() {
  if (props.quantity <= props.min) {
    emit('minus');
  } else {
    emit('change', props.quantity - 1);
  }
}

function handlePlus() {
  emit('change', props.quantity + 1);
}
</script>

<style lang="scss" scoped>
.qty-stepper {
  display: flex;
  align-items: center;
  background: #f5f3f3;
  border-radius: 9999rpx;
  padding: 4rpx;
  gap: 0;
}

.qty-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  .qty-icon {
    font-size: 30rpx;
    color: #5d3f3b;
    font-weight: 600;
    line-height: 1;
    font-family: 'Manrope', sans-serif;
  }

  &:active {
    background: #e9e8e7;

    .qty-icon {
      color: #bb0004;
    }
  }

  &.qty-plus {
    background: #bb0004;

    .qty-icon {
      color: #ffffff;
    }

    &:active {
      background: #e1251b;
      opacity: 0.9;
    }
  }
}

.qty-num {
  min-width: 64rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #1b1c1c;
  font-family: 'Manrope', sans-serif;
  padding: 0 8rpx;
}
</style>