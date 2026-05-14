<template>
  <view class="cart-footer">
    <view class="footer-left">
      <view class="select-all" @click="$emit('toggle-all')">
        <view class="check-circle" :class="{ checked: isAllChecked }">
          <uni-icons type="checkmarkempty" size="16" color="#fff" v-if="isAllChecked"></uni-icons>
        </view>
        <text class="select-all-text">全选</text>
      </view>
      <view class="total-info">
        <ShippingProgress :totalPrice="totalPrice" />
        <view class="price-row">
          <text class="total-label">合计</text>
          <view class="total-price-wrap">
            <text class="price-symbol total-symbol">¥</text>
            <text class="total-price">{{ totalPrice.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="footer-right">
      <view
        class="btn-settlement"
        :class="{ 'btn-delete': isEdit }"
        @click="$emit('checkout')"
      >
        <text v-if="!isEdit">去结算</text>
        <text v-else>删除</text>
        <text class="settlement-count" v-if="!isEdit && checkedCount">({{ checkedCount }}件)</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import ShippingProgress from './ShippingProgress.vue';

defineProps({
  isAllChecked: Boolean,
  totalPrice: {
    type: Number,
    default: 0,
  },
  checkedCount: {
    type: Number,
    default: 0,
  },
  isEdit: Boolean,
});

defineEmits(['toggle-all', 'checkout']);
</script>

<style lang="scss" scoped>
.cart-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  z-index: 100;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 120rpx;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.select-all {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.check-circle {
  width: 44rpx;
  height: 44rpx;
  border: 3rpx solid #e7bdb7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: transparent;

  &.checked {
    background: #bb0004;
    border-color: #bb0004;
    box-shadow: 0 4rpx 12rpx rgba(#bb0004, 0.3);

    .fa-check {
      color: #ffffff;
    }
  }
}

.select-all-text {
  font-size: 20rpx;
  font-weight: 700;
  color: #5d3f3b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.total-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-left: 8rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.total-label {
  font-size: 22rpx;
  color: #5d3f3b;
  font-weight: 500;
}

.total-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.price-symbol {
  font-size: 20rpx;
  font-weight: 700;
  color: #bb0004;
  font-family: 'Manrope', sans-serif;
}

.total-symbol {
  font-size: 24rpx;
}

.total-price {
  font-family: 'Manrope', sans-serif;
  font-size: 36rpx;
  font-weight: 800;
  color: #bb0004;
  letter-spacing: -0.03em;
}

.footer-right {
  display: flex;
  align-items: center;
}

.btn-settlement {
  background: linear-gradient(135deg, #bb0004 0%, #e1251b 100%);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  padding: 0 40rpx;
  height: 80rpx;
  border-radius: 9999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(#bb0004, 0.3);
  transition: all 0.2s ease;

  .settlement-count {
    font-size: 20rpx;
    font-weight: 500;
    opacity: 0.85;
    margin-left: 4rpx;
  }

  &:active {
    opacity: 0.88;
    transform: scale(0.96);
    box-shadow: 0 4rpx 16rpx rgba(#bb0004, 0.25);
  }

  &.btn-delete {
    background: #e9e8e7;
    box-shadow: none;

    &:active {
      background: #e3e2e2;
    }
  }
}
</style>