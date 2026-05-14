<template>
  <view class="page">
    <header class="nav-header">
      <view class="nav-inner">
        <view class="nav-left">
          <uni-icons type="cart-filled" size="20" color="#bb0004" class="nav-icon"></uni-icons>
          <text class="nav-title">我的购物车</text>
        </view>
        <view class="nav-right" @click="toggleEdit">
          <text class="nav-manage">{{ isEdit ? '完成' : '编辑' }}</text>
        </view>
      </view>
    </header>

    <view class="empty-cart" v-if="cartList.length === 0 && !loading">
      <view class="empty-icon-wrap">
        <uni-icons type="cart-filled" size="40" color="#5d3f3b" class="empty-icon"></uni-icons>
      </view>
      <text class="empty-text">购物车是空的</text>
      <view class="empty-btn" @click="goShopping">去逛逛</view>
      <view class="empty-btn-fav" @click="goFavorites">从收藏夹添加</view>
    </view>

    <view class="cart-content" v-else>
      <CartTipBar :itemCount="cartList.length" :hasInvalid="invalidItems.length > 0" @clear-invalid="confirmClearInvalid" />

      <view class="cart-list">
        <CartItemCard
          v-for="(item, index) in cartList"
          :key="item.id || `${item.product_id}-${item.sku_id}`"
          :item="item"
          @toggle-check="toggleCheck(index)"
          @go-detail="goDetail(item)"
          @change-sku="showSkuPopup(item, index)"
          @update-quantity="updateQuantity(index, $event)"
          @minus="decrease(index)"
        />
      </view>

      <RecommendSection
        :list="recommendList"
        @go-detail="goDetail"
        @add-cart="addToCart"
      />
    </view>

    <view class="bottom-placeholder" v-if="cartList.length > 0"></view>

    <CartFooter
      v-if="cartList.length > 0"
      :isAllChecked="isAllChecked"
      :totalPrice="totalPrice"
      :checkedCount="checkedCount"
      :isEdit="isEdit"
      @toggle-all="toggleAllCheck"
      @checkout="isEdit ? deleteChecked() : goSettlement()"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import { useCartStore } from '@/stores/cart.js';
import { checkLogin } from '@/utils/auth.js';
import CartTipBar from '@/components/CartTipBar.vue';
import CartItemCard from '@/components/CartItemCard.vue';
import CartFooter from '@/components/CartFooter.vue';
import RecommendSection from '@/components/RecommendSection.vue';

const cartStore = useCartStore();
const loading = ref(false);
const isEdit = ref(false);
const cartList = ref([]);
const recommendList = ref([]);

const isAllChecked = computed(() => cartList.value.length > 0 && cartList.value.every(item => item.is_checked));
const checkedCount = computed(() => cartList.value.filter(item => item.is_checked).reduce((sum, item) => sum + item.quantity, 0));
const totalPrice = computed(() => cartList.value.filter(item => item.is_checked).reduce((sum, item) => sum + item.price * item.quantity, 0));
const invalidItems = computed(() => cartList.value.filter(item => (item.stock || 0) === 0 || item.product_status === 0));

function toggleEdit() {
  isEdit.value = !isEdit.value;
}

function toggleCheck(index) {
  cartList.value[index].is_checked = !cartList.value[index].is_checked;
  cartStore.syncCartCheck(cartList.value[index]);
}

function toggleAllCheck() {
  const checked = !isAllChecked.value;
  cartList.value.forEach(item => { item.is_checked = checked; });
  cartStore.syncAllChecked(checked);
}

function decrease(index) {
  if (cartList.value[index].quantity <= 1) {
    uni.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      confirmColor: '#bb0004',
      success: (res) => { if (res.confirm) removeItem(index); }
    });
    return;
  }
  updateQuantity(index, cartList.value[index].quantity - 1);
}

function increase(index) {
  updateQuantity(index, cartList.value[index].quantity + 1);
}

async function updateQuantity(index, quantity) {
  const item = cartList.value[index];
  try {
    await request.put(`/cart/${item.id}`, { quantity });
    cartList.value[index].quantity = quantity;
    cartStore.setList(cartList.value);
  } catch (e) {
    console.error('更新数量失败', e);
  }
}

async function removeItem(index) {
  const item = cartList.value[index];
  try {
    await request.delete(`/cart/${item.id}`);
    cartList.value.splice(index, 1);
    cartStore.setList(cartList.value);
  } catch (e) {
    console.error('删除失败', e);
  }
}

async function deleteChecked() {
  const checkedItems = cartList.value.filter(item => item.is_checked);
  if (checkedItems.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' });
    return;
  }
  try {
    await request.delete('/cart/batch', { ids: checkedItems.map(item => item.id) });
    cartList.value = cartList.value.filter(item => !item.is_checked);
    cartStore.setList(cartList.value);
  } catch (e) {
    console.error('批量删除失败', e);
  }
}

function confirmClearInvalid() {
  uni.showModal({
    title: '提示',
    content: '确定要删除所有失效商品吗？',
    confirmColor: '#bb0004',
    success: (res) => { if (res.confirm) clearInvalid(); }
  });
}

async function clearInvalid() {
  const invalid = cartList.value.filter(item => (item.stock || 0) === 0 || item.product_status === 0);
  if (invalid.length === 0) return;
  try {
    await request.delete('/cart/batch', { ids: invalid.map(item => item.id) });
    cartList.value = cartList.value.filter(item => (item.stock || 0) !== 0 && item.product_status !== 0);
    cartStore.setList(cartList.value);
  } catch (e) {
    console.error('清理失效商品失败', e);
  }
}

function goShopping() {
  uni.switchTab({ url: '/pages/index/index' });
}

function goFavorites() {
  uni.navigateTo({ url: '/pages/favorite/index' });
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.product_id}` });
}

function showSkuPopup(item, index) {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.product_id}` });
}

function goSettlement() {
  const checkedItems = cartList.value.filter(item => item.is_checked);
  if (checkedItems.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' });
    return;
  }
  const invalidChecked = checkedItems.filter(item => (item.stock || 0) === 0 || item.product_status === 0);
  if (invalidChecked.length > 0) {
    uni.showModal({
      title: '提示',
      content: `您选中了 ${invalidChecked.length} 件失效商品，请先删除后再结算`,
      confirmColor: '#bb0004',
      showCancel: false,
    });
    return;
  }
  uni.setStorageSync('settlement_items', JSON.stringify(checkedItems));
  uni.navigateTo({ url: '/pages/order/confirm' });
}

function addToCart(item) {
  cartStore.addItem({
    product_id: item.id,
    sku_id: null,
    title: item.title,
    cover_image: item.cover_image,
    price: item.price,
    quantity: 1,
    stock: item.stock,
  });
}

onShow(async () => {
  if (checkLogin()) {
    await loadCartList();
  } else {
    cartList.value = [];
  }
  await loadRecommend();
});

async function loadCartList() {
  loading.value = true;
  try {
    const data = await request.get('/cart/list');
    cartList.value = (data || []).map(item => ({
      ...item,
      cover_image: request.fixImageUrl(item.cover_image),
      price: parseFloat(item.price) || 0
    }));
    cartStore.setList(cartList.value);
  } catch (e) {
    console.error('加载购物车失败', e);
  } finally {
    loading.value = false;
  }
}

async function loadRecommend() {
  try {
    const res = await request.get('/cart/recommend');
    recommendList.value = (res || []).map(p => request.normalizeProduct(p));
  } catch (e) {
    console.error('加载推荐失败', e);
  }
}
</script>

<style lang="scss">
$primary: #bb0004;
$primary-container: #e1251b;
$on-primary: #ffffff;
$surface: #fbf9f9;
$surface-lowest: #ffffff;
$surface-low: #f5f3f3;
$surface-high: #e9e8e7;
$surface-highest: #e3e2e2;
$surface-container-low: #f5f3f3;
$surface-container-high: #e9e8e7;
$on-surface: #1b1c1c;
$on-surface-variant: #5d3f3b;
$radius-xl: 24rpx;
$radius-full: 9999rpx;
$tabbar-height: 100rpx;

.page {
  min-height: 100vh;
  background: $surface;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: env(safe-area-inset-top);
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 128rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.05);
  padding-top: env(safe-area-inset-top);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 32rpx;
  max-width: 750rpx;
  margin: 0 auto;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nav-icon {
  font-size: 40rpx;
  color: $primary;
}

.nav-title {
  font-family: 'Manrope', sans-serif;
  font-size: 34rpx;
  font-weight: 800;
  color: $on-surface;
}

.nav-right {
  display: flex;
  align-items: center;
}

.nav-manage {
  font-size: 26rpx;
  font-weight: 600;
  color: $on-surface-variant;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 280rpx;
}

.empty-icon-wrap {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: $surface-container-low;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  color: $on-surface-variant;
}

.empty-text {
  font-size: 28rpx;
  color: $on-surface-variant;
  margin-bottom: 56rpx;
}

.empty-btn {
  padding: 22rpx 72rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  border-radius: $radius-full;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 32rpx rgba($primary, 0.28);
}

.empty-btn-fav {
  margin-top: 24rpx;
  padding: 22rpx 72rpx;
  background: $surface-container-high;
  color: $on-surface-variant;
  border-radius: $radius-full;
  font-size: 28rpx;
  font-weight: 700;
}

.cart-content {
  padding: 128rpx 32rpx 0;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.bottom-placeholder {
  height: calc(140rpx + 100rpx);
}
</style>