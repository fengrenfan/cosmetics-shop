<template>
  <view class="sku-modal" v-if="show" @click="close">
    <view class="sku-content" @click.stop>
      <!-- 商品信息 -->
      <view class="sku-product">
        <image class="sku-image" :src="selectedImage || product?.cover_image" mode="aspectFill" />
        <view class="sku-info">
          <text class="sku-price">¥{{ finalPrice }}</text>
          <text class="sku-stock">库存: {{ finalStock }}</text>
          <text class="sku-selected-text" v-if="selectedSpecText">{{ selectedSpecText }}</text>
        </view>
        <text class="sku-close iconfont fa-xmark close" @click="close"></text>
      </view>

      <!-- SKU 规格（多规格模式） -->
      <view class="sku-list" v-if="skuSpecList.length > 0">
        <view class="sku-group" v-for="spec in skuSpecList" :key="spec.name">
          <text class="sku-group-title">{{ spec.name }}</text>
          <view class="sku-options">
            <view
              class="sku-option"
              :class="{ active: selectedSpecs[spec.name] === option, disabled: !spec.availableValues.includes(option) }"
              v-for="option in spec.values"
              :key="option"
              @click="selectSpec(spec.name, option)"
            >
              {{ option }}
            </view>
          </view>
        </view>
      </view>

      <!-- 单规格模式（兼容简单SKU列表） -->
      <view class="sku-list" v-else-if="product?.skus?.length > 0">
        <view class="sku-group">
          <text class="sku-group-title">规格</text>
          <view class="sku-options">
            <view
              class="sku-option"
              :class="{ active: currentSkuId === sku.id, disabled: sku.stock <= 0 }"
              v-for="sku in product.skus"
              :key="sku.id"
              @click="selectSku(sku)"
            >
              {{ sku.sku_name }}
            </view>
          </view>
        </view>
      </view>

      <!-- 数量选择 -->
      <view class="quantity-section">
        <text class="quantity-label">数量</text>
        <view class="quantity-control">
          <view class="qty-btn" @click="decreaseQuantity">
            <text class="qty-icon">−</text>
          </view>
          <input class="qty-input" type="number" v-model="quantity" :max="finalStock" />
          <view class="qty-btn" @click="increaseQuantity">
            <text class="qty-icon">+</text>
          </view>
        </view>
      </view>

      <!-- 按钮 -->
      <view class="sku-actions">
        <view class="sku-btn" :class="actionType === 'cart' ? 'cart' : 'buy'" @click="confirm">
          <text>确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import request from '@/utils/request.js';

const props = defineProps({
  show: Boolean,
  product: Object,
  actionType: { type: String, default: 'cart' }
});

const emit = defineEmits(['close', 'confirm']);

const selectedSpecs = ref({});
const skuSpecList = ref([]);
const currentSkuId = ref(null);
const currentSku = ref(null);
const quantity = ref(1);
const maxQuantity = ref(999);

watch(() => props.show, (val) => {
  if (val && props.product) {
    initData();
  }
});

function initData() {
  const p = props.product;
  selectedSpecs.value = {};
  currentSkuId.value = null;
  currentSku.value = null;
  quantity.value = 1;

  if (p.skus?.length > 0) {
    const specMap = {};
    let hasValidSpecs = false;

    p.skus.forEach(sku => {
      const specs = sku.sku_name ? sku.sku_name.split(',') : [];
      specs.forEach(spec => {
        const [name, value] = spec.split(':');
        if (name && value) {
          hasValidSpecs = true;
          if (!specMap[name]) specMap[name] = new Set();
          specMap[name].add(value.trim());
        }
      });
    });

    // 如果能解析出多规格（name:value格式），使用多规格模式
    if (hasValidSpecs && Object.keys(specMap).length > 0) {
      skuSpecList.value = Object.entries(specMap).map(([name, values]) => ({
        name: name.trim(),
        values: Array.from(values),
        availableValues: Array.from(values)
      }));
    } else {
      // 否则使用单规格模式（sku_name 不符合 name:value 格式）
      skuSpecList.value = [];
    }

    maxQuantity.value = p.stock || 999;
  } else {
    skuSpecList.value = [];
    maxQuantity.value = p.stock || 999;
  }
}

const selectedSpecText = computed(() => {
  return Object.entries(selectedSpecs.value)
    .map(([key, val]) => val)
    .filter(Boolean)
    .join(' / ');
});

const selectedImage = computed(() => {
  if (currentSku.value?.image) return currentSku.value.image;
  return props.product?.cover_image;
});

const finalPrice = computed(() => {
  if (currentSku.value?.price) return currentSku.value.price;
  return props.product?.price || 0;
});

const finalStock = computed(() => {
  if (currentSku.value?.stock !== undefined) return currentSku.value.stock;
  return props.product?.stock || 0;
});

function selectSpec(name, value) {
  selectedSpecs.value[name] = value;
  const matched = findMatchedSku();
  if (matched) {
    currentSkuId.value = matched.id;
    currentSku.value = matched;
    maxQuantity.value = matched.stock || 999;
    if (quantity.value > maxQuantity.value) {
      quantity.value = maxQuantity.value;
    }
  }
}

function selectSku(sku) {
  if (sku.stock <= 0) return;
  currentSkuId.value = sku.id;
  currentSku.value = sku;
  maxQuantity.value = sku.stock || 999;
  if (quantity.value > maxQuantity.value) {
    quantity.value = maxQuantity.value;
  }
}

function findMatchedSku() {
  if (!props.product?.skus?.length) return null;
  const entries = Object.entries(selectedSpecs.value).filter(([k, v]) => v);
  if (entries.length === 0) return null;
  return props.product.skus.find(sku => {
    const skuSpecs = sku.sku_name ? sku.sku_name.split(',') : [];
    return entries.every(([name, value]) => skuSpecs.some(spec => spec.includes(value)));
  });
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function increaseQuantity() {
  if (quantity.value < maxQuantity.value) {
    quantity.value++;
  } else {
    uni.showToast({ title: '库存不足', icon: 'none' });
  }
}

function close() {
  emit('close');
}

function confirm() {
  // 有规格但未选择
  if (product?.skus?.length > 0) {
    if (skuSpecList.value.length > 0) {
      // 多规格模式
      if (Object.keys(selectedSpecs.value).length < skuSpecList.value.length) {
        uni.showModal({
          title: '提示',
          content: '请选择完整的规格',
          confirmText: '我知道了',
          showCancel: false,
        });
        return;
      }
      if (!currentSkuId.value) {
        uni.showModal({
          title: '提示',
          content: '该规格已售罄，请选择其他规格',
          confirmText: '我知道了',
          showCancel: false,
        });
        return;
      }
    } else {
      // 单规格模式
      if (!currentSkuId.value) {
        uni.showModal({
          title: '提示',
          content: '请选择规格',
          confirmText: '我知道了',
          showCancel: false,
        });
        return;
      }
    }
  }

  emit('confirm', {
    sku_id: currentSkuId.value,
    quantity: quantity.value,
    price: finalPrice.value,
    stock: finalStock.value,
    sku_name: currentSku.value?.sku_name || ''
  });
}
</script>

<style lang="scss" scoped>
.sku-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.sku-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.sku-product {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.sku-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.sku-info {
  flex: 1;
  margin-left: 24rpx;
}

.sku-price {
  display: block;
  font-size: 36rpx;
  color: #ff4a8d;
  font-weight: bold;
}

.sku-stock {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.sku-selected-text {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-top: 8rpx;
}

.sku-close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.sku-list {
  padding: 30rpx;
}

.sku-group-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.sku-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.sku-option {
  padding: 16rpx 32rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;

  &.active {
    background: #ffe6f0;
    color: #ff4a8d;
    border: 1rpx solid #ff4a8d;
  }

  &.disabled {
    color: #ccc;
    text-decoration: line-through;
  }
}

.quantity-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-top: 1rpx solid #f5f5f5;
}

.quantity-label {
  font-size: 28rpx;
  color: #333;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.qty-icon {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.qty-input {
  width: 80rpx;
  height: 56rpx;
  text-align: center;
  font-size: 28rpx;
  background: #f5f5f5;
  margin: 0 4rpx;
}

.sku-actions {
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.sku-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;

  &.cart {
    background: linear-gradient(135deg, #ff9500 0%, #ffb347 100%);
    color: #fff;
  }

  &.buy {
    background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
    color: #fff;
  }
}
</style>
