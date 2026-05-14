<template>
  <view
    class="cart-item"
    :class="{ 'item-checked': item.is_checked, 'item-invalid': isInvalid }"
  >
    <view class="item-check" @click="$emit('toggle-check')">
      <view class="check-circle" :class="{ checked: item.is_checked }">
        <uni-icons type="checkmarkempty" size="16" color="#fff" v-if="item.is_checked"></uni-icons>
      </view>
    </view>

    <view class="item-img-wrap" @click="$emit('go-detail')">
      <image class="item-image" :src="item.cover_image" mode="aspectFill" />
      <view class="invalid-badge" v-if="isInvalid">
        <text>{{ invalidLabel }}</text>
      </view>
    </view>

    <view class="item-info">
      <text class="item-title" @click="$emit('go-detail')">{{ item.title }}</text>
      <view class="item-sku-row" v-if="item.sku_name" @click="$emit('change-sku')">
        <text class="item-sku">{{ item.sku_name }}</text>
        <uni-icons type="down" size="11" color="#5d3f3b" class="sku-arrow"></uni-icons>
      </view>
      <view class="item-bottom">
        <view class="item-price-wrap">
          <text class="price-symbol">¥</text>
          <text class="price-int">{{ String(item.price).split('.')[0] }}</text>
          <text class="price-dec">.{{ String(item.price).split('.')[1] || '00' }}</text>
        </view>
        <QuantityStepper
          :quantity="item.quantity"
          @change="$emit('update-quantity', $event)"
          @minus="$emit('minus')"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import QuantityStepper from './QuantityStepper.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

defineEmits(['toggle-check', 'go-detail', 'change-sku', 'update-quantity', 'minus']);

const isInvalid = computed(() => {
  const stock = props.item.stock || 0;
  const status = props.item.product_status;
  return stock === 0 || status === 0;
});

const invalidLabel = computed(() => {
  return props.item.product_status === 0 ? '已下架' : '缺货';
});
</script>

<style lang="scss" scoped>
.cart-item {
  display: flex;
  align-items: flex-start;
  padding: 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  gap: 20rpx;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);

  &.item-checked {
    box-shadow: 0 4rpx 20rpx rgba(#bb0004, 0.08);
  }

  &.item-invalid {
    opacity: 0.6;

    .item-title {
      text-decoration: line-through;
    }
  }
}

.item-check {
  flex-shrink: 0;
  padding-top: 56rpx;
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

.item-img-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f5f3f3;
  flex-shrink: 0;
  position: relative;
}

.item-image {
  width: 100%;
  height: 100%;
}

.invalid-badge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;

  text {
    font-size: 20rpx;
    color: #fff;
    font-weight: 600;
    background: #bb0004;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
  }
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 28rpx;
  color: #1b1c1c;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
  margin-bottom: 12rpx;
}

.item-sku-row {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-bottom: 16rpx;
}

.item-sku {
  font-size: 22rpx;
  color: #5d3f3b;
  background: #e9e8e7;
  padding: 6rpx 18rpx;
  border-radius: 4rpx;
  font-weight: 500;
}

.sku-arrow {
  font-size: 22rpx;
  color: #5d3f3b;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.item-price-wrap {
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

.price-int {
  font-size: 36rpx;
  font-weight: 800;
  color: #bb0004;
  font-family: 'Manrope', sans-serif;
}

.price-dec {
  font-size: 20rpx;
  font-weight: 700;
  color: #bb0004;
}
</style>