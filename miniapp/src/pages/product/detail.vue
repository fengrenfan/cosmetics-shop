<template>
  <view class="page">
    <!-- 商品图片轮播 -->
    <swiper class="product-swiper" :indicator-dots="product.images?.length > 1" :autoplay="true" :interval="3000" indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#fff" v-if="product.images?.length > 0">
      <swiper-item v-for="(image, index) in product.images" :key="index">
        <image class="product-image" :src="image" mode="aspectFill" @click="previewImage(index)" />
      </swiper-item>
    </swiper>
    <view class="product-swiper no-image" v-else>
      <image class="product-image" :src="product.cover_image || '/static/default-product.png'" mode="aspectFill" />
    </view>

    <!-- 价格信息 -->
    <view class="price-section">
      <view class="price-row">
        <text class="current-price">¥{{ currentSku?.price || product.price }}</text>
        <text class="original-price" v-if="product.original_price">¥{{ product.original_price }}</text>
        <view class="price-tag" v-if="product.is_seckill">秒杀</view>
      </view>
      <view class="product-tags">
        <text class="tag" v-if="product.is_new">新品</text>
        <text class="tag" v-if="product.is_hot">热卖</text>
        <text class="tag" v-if="product.is_recommend">推荐</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="info-section">
      <text class="product-title">{{ product.title }}</text>
      <text class="product-subtitle" v-if="product.subtitle">{{ product.subtitle }}</text>
      <view class="product-meta">
        <text>销量 {{ product.sales_count || 0 }}</text>
        <text>库存 {{ currentSku?.stock || product.stock }}</text>
      </view>
    </view>

    <!-- 配送信息 -->
    <view class="delivery-section">
      <view class="delivery-item">
        <text class="iconfont local_shipping"></text>
        <text>快递: ¥{{ freight }} {{ freight > 0 ? '(满99包邮)' : '(包邮)' }}</text>
      </view>
      <view class="delivery-item">
        <text class="iconfont location_on"></text>
        <text>{{ product.category?.name || '全国' }}</text>
      </view>
    </view>

    <!-- SKU 选择 -->
    <view class="sku-section" @click="showSkuModal">
      <view class="sku-header">
        <text class="sku-title">选择</text>
        <text class="sku-selected">{{ selectedSkuText || '请选择规格' }}</text>
      </view>
      <text class="iconfont chevron_right"></text>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="detail-tabs">
        <view class="detail-tab" :class="{ active: detailTab === 'detail' }" @click="detailTab = 'detail'">商品详情</view>
        <view class="detail-tab" :class="{ active: detailTab === 'specs' }" @click="detailTab = 'specs'">规格参数</view>
        <view class="detail-tab" :class="{ active: detailTab === 'reviews' }" @click="loadReviews">评价</view>
      </view>

      <!-- 商品详情内容 -->
      <view class="detail-content" v-if="detailTab === 'detail'">
        <rich-text :nodes="product.detail_html || '<p style=&quot;text-align:center;color:#999;&quot;>暂无商品详情</p>'"></rich-text>
      </view>

      <!-- 规格参数 -->
      <view class="specs-content" v-if="detailTab === 'specs'">
        <view class="specs-item">
          <text class="specs-label">商品名称</text>
          <text class="specs-value">{{ product.title }}</text>
        </view>
        <view class="specs-item">
          <text class="specs-label">商品分类</text>
          <text class="specs-value">{{ product.category?.name }}</text>
        </view>
        <view class="specs-item">
          <text class="specs-label">单位</text>
          <text class="specs-value">{{ product.unit || '件' }}</text>
        </view>
      </view>

      <!-- 商品评价 -->
      <view class="reviews-content" v-if="detailTab === 'reviews'">
        <view class="review-item" v-for="item in reviews" :key="item.id">
          <view class="review-header">
            <image class="review-avatar" :src="item.user?.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
            <view class="review-user-info">
              <text class="review-name">{{ item.user?.nickname || '匿名用户' }}</text>
              <view class="review-rating">
                <text class="iconfont star" v-for="n in 5" :key="n" :class="{ active: n <= item.rating }"></text>
                <text class="rating-text">{{ item.rating }}分</text>
              </view>
            </view>
          </view>
          <text class="review-content">{{ item.content }}</text>
          <view class="review-images" v-if="item.images && item.images.length > 0">
            <image v-for="(img, idx) in item.images" :key="idx" :src="img" mode="aspectFill" @click="previewReviewImage(item.images, idx)"></image>
          </view>
          <text class="review-time">{{ formatTime(item.created_at) }}</text>
        </view>
        <view class="empty-reviews" v-if="reviews.length === 0 && !reviewsLoading">
          <text>暂无评价</text>
        </view>
        <view class="loading-reviews" v-if="reviewsLoading">
          <text>加载中...</text>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-icons">
        <view class="action-icon" @click="toggleFavorite">
          <text class="iconfont star-icon" :class="{ active: isFavorite }">star</text>
          <text>收藏</text>
        </view>
        <view class="action-icon" @click="goCart">
          <text class="iconfont cart-icon">shopping_cart</text>
          <text>购物车</text>
          <view class="cart-badge" v-if="cartCount > 0">{{ cartCount > 99 ? '99+' : cartCount }}</view>
        </view>
      </view>
      <view class="action-buttons">
        <view class="btn-add-cart" @click="handleAddCart">加入购物车</view>
        <view class="btn-buy-now" @click="handleBuyNow">立即购买</view>
      </view>
    </view>

    <!-- SKU 弹窗 -->
    <view class="sku-modal" v-if="showSku" @click="closeSkuModal">
      <view class="sku-content" @click.stop>
        <!-- 商品信息 -->
        <view class="sku-product">
          <image class="sku-image" :src="selectedImage || product.cover_image || product.images?.[0]"></image>
          <view class="sku-info">
            <text class="sku-price">¥{{ finalPrice }}</text>
            <text class="sku-stock">库存: {{ finalStock }}</text>
            <text class="sku-selected-text" v-if="selectedSpecText">{{ selectedSpecText }}</text>
          </view>
          <text class="sku-close iconfont close" @click="closeSkuModal"></text>
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
        <view class="sku-list" v-else-if="product.skus?.length > 0">
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
            <view class="qty-btn" @click="decreaseQuantity">-</view>
            <input class="qty-input" type="number" v-model="quantity" :max="finalStock" />
            <view class="qty-btn" @click="increaseQuantity">+</view>
          </view>
        </view>

        <!-- 按钮 -->
        <view class="sku-actions">
          <view class="sku-btn cart" @click="handleSkuConfirm" v-if="actionType === 'cart'">确定</view>
          <view class="sku-btn buy" @click="handleSkuConfirm" v-if="actionType === 'buy'">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import { useCartStore } from '@/stores/cart.js';

const cartStore = useCartStore();
const product = ref({});
const currentSkuId = ref(null);
const currentSku = ref(null);
const selectedSkuText = ref('');
const quantity = ref(1);
const maxQuantity = ref(1);
const detailTab = ref('detail');
const reviews = ref([]);
const reviewsLoading = ref(false);
const isFavorite = ref(false);
const cartCount = ref(0);
const showSku = ref(false);
const actionType = ref('cart');
const freight = ref(10);

const productId = ref(null);

// 多规格SKU相关
const selectedSpecs = ref({}); // { 颜色: '红色', 容量: '256G' }
const skuSpecList = ref([]);   // [{ name: '颜色', values: ['红色', '蓝色'], availableValues: ['红色', '蓝色'] }]

// 计算属性
const selectedSpecText = computed(() => {
  return Object.entries(selectedSpecs.value)
    .map(([key, val]) => val)
    .filter(Boolean)
    .join(' / ');
});

const selectedImage = computed(() => {
  // 如果选中了规格，且有对应图片，返回对应图片
  if (currentSku.value?.image) {
    return currentSku.value.image;
  }
  return product.value.cover_image || product.value.images?.[0];
});

const finalPrice = computed(() => {
  if (currentSku.value?.price) {
    return currentSku.value.price;
  }
  return product.value.price;
});

const finalStock = computed(() => {
  if (currentSku.value?.stock !== undefined) {
    return currentSku.value.stock;
  }
  return product.value.stock || 0;
});

onLoad((options) => {
  productId.value = options.id;
  if (productId.value) {
    loadProductDetail();
    checkFavorite();
    loadCartCount();
  }
});

async function loadProductDetail() {
  try {
    const data = await request.get(`/product/${productId.value}`);
    // 修复图片URL
    data.cover_image = request.fixImageUrl(data.cover_image);
    data.images = request.fixImageUrls(data.images || []);
    if (data.skus) {
      data.skus = data.skus.map(sku => ({
        ...sku,
        image: request.fixImageUrl(sku.image),
        price: parseFloat(sku.price) || 0
      }));
    }
    // 规范化数据格式
    product.value = {
      ...data,
      price: parseFloat(data.price) || 0,
      original_price: data.original_price ? parseFloat(data.original_price) : 0,
      stock: data.stock || 0,
      sales_count: data.sales_count || 0,
      is_new: !!data.is_new,
      is_hot: !!data.is_hot,
      is_recommend: !!data.is_recommend,
      is_seckill: false
    };
    maxQuantity.value = data.stock || 999;
    
    // 解析SKU规格（支持多规格组合）
    if (data.skus?.length > 0) {
      const specMap = {};
      const availableCombos = {};
      
      data.skus.forEach(sku => {
        // 解析规格组合（如 "红色,256G"）
        const specs = sku.sku_name ? sku.sku_name.split(',') : [];
        const key = sku.sku_name;
        availableCombos[key] = sku;
        
        specs.forEach(spec => {
          const [name, value] = spec.split(':');
          if (name && value) {
            if (!specMap[name]) {
              specMap[name] = new Set();
            }
            specMap[name].add(value.trim());
          }
        });
      });
      
      // 构建规格列表
      skuSpecList.value = Object.entries(specMap).map(([name, values]) => ({
        name: name.trim(),
        values: Array.from(values),
        availableValues: Array.from(values) // 初始都可用
      }));
      
      // 如果只有一个规格，直接选中第一个
      if (skuSpecList.value.length === 1 && data.skus.length > 0) {
        const firstSpec = skuSpecList.value[0];
        selectedSpecs.value[firstSpec.name] = firstSpec.values[0];
        currentSkuId.value = data.skus[0].id;
        currentSku.value = data.skus[0];
        selectedSkuText.value = data.skus[0].sku_name;
      }
    }
    
    // 计算运费
    freight.value = data.price >= 99 ? 0 : 10;
  } catch (e) {
    console.error('加载商品详情失败', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
}

function selectSpec(specName, value) {
  selectedSpecs.value[specName] = value;
  
  // 检查是否有匹配的SKU
  const matchedSku = findMatchedSku();
  if (matchedSku) {
    currentSkuId.value = matchedSku.id;
    currentSku.value = matchedSku;
    selectedSkuText.value = matchedSku.sku_name;
    maxQuantity.value = matchedSku.stock;
    if (quantity.value > maxQuantity.value) {
      quantity.value = maxQuantity.value;
    }
  }
}

function findMatchedSku() {
  if (!product.value.skus?.length) return null;
  
  // 构建当前选择的规格字符串
  const selectedSpecEntries = Object.entries(selectedSpecs.value).filter(([k, v]) => v);
  if (selectedSpecEntries.length === 0) return null;
  
  // 匹配SKU
  return product.value.skus.find(sku => {
    const skuSpecs = sku.sku_name.split(',');
    return selectedSpecEntries.every(([name, value]) => {
      return skuSpecs.some(spec => spec.includes(value));
    });
  });
}

function selectSku(sku) {
  if (sku.stock <= 0) return;
  currentSkuId.value = sku.id;
  currentSku.value = sku;
  selectedSkuText.value = sku.sku_name;
  maxQuantity.value = sku.stock;
  if (quantity.value > maxQuantity.value) {
    quantity.value = maxQuantity.value;
  }
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

function previewImage(index) {
  uni.previewImage({
    urls: product.value.images,
    current: product.value.images[index]
  });
}

function previewReviewImage(images, index) {
  uni.previewImage({
    urls: images,
    current: images[index]
  });
}

function showSkuModal(type) {
  actionType.value = type;
  showSku.value = true;
}

function closeSkuModal() {
  showSku.value = false;
}

function handleSkuConfirm() {
  // 检查是否选择了SKU规格
  if (skuSpecList.value.length > 0) {
    if (Object.keys(selectedSpecs.value).length < skuSpecList.value.length) {
      uni.showToast({ title: '请选择完整的规格', icon: 'none' });
      return;
    }
    if (!currentSkuId.value) {
      uni.showToast({ title: '该规格已售罄', icon: 'none' });
      return;
    }
  }
  
  if (actionType.value === 'cart') {
    addToCart();
  } else {
    buyNow();
  }
}

async function addToCart() {
  // 检查是否选择了 SKU
  if (product.value.skus?.length > 0 && !currentSkuId.value) {
    uni.showToast({ title: '请选择规格', icon: 'none' });
    return;
  }

  try {
    const data = await request.post('/cart/add', {
      product_id: productId.value,
      sku_id: currentSkuId.value,
      quantity: quantity.value
    });
    
    uni.showToast({ title: '添加成功', icon: 'success' });
    closeSkuModal();
    loadCartCount();
    
    // 更新本地购物车状态
    cartStore.addItem({
      id: data.id,
      product_id: productId.value,
      sku_id: currentSkuId.value,
      title: product.value.title,
      cover_image: product.value.cover_image,
      price: currentSku.value?.price || product.value.price,
      quantity: quantity.value,
      stock: maxQuantity.value
    });
  } catch (e) {
    console.error('添加购物车失败', e);
  }
}

function buyNow() {
  // 检查是否选择了 SKU
  if (product.value.skus?.length > 0 && !currentSkuId.value) {
    uni.showToast({ title: '请选择规格', icon: 'none' });
    return;
  }

  // 构建商品信息
  const item = {
    id: currentSkuId.value,
    product_id: productId.value,
    sku_id: currentSkuId.value,
    title: product.value.title,
    cover_image: selectedImage.value,
    price: finalPrice.value,
    quantity: quantity.value,
    sku_name: selectedSkuText.value || selectedSkuText.value,
    stock: finalStock.value
  };

  uni.setStorageSync('settlement_items', JSON.stringify([item]));
  uni.navigateTo({ url: '/pages/order/confirm' });
}

async function toggleFavorite() {
  try {
    const res = await request.post('/favorite/toggle', { product_id: productId.value });
    if (res?.is_favorite !== undefined) {
      isFavorite.value = res.is_favorite;
    } else {
      isFavorite.value = !isFavorite.value;
    }
    uni.showToast({ title: isFavorite.value ? '收藏成功' : '已取消收藏', icon: 'success' });
  } catch (e) {
    console.error('操作失败', e);
  }
}

async function checkFavorite() {
  try {
    const res = await request.get('/favorite/list');
    const list = res || [];
    isFavorite.value = list.some(item => item.id == productId.value || item.product_id == productId.value);
  } catch (e) {
    // 忽略
  }
}

async function loadCartCount() {
  try {
    const res = await request.get('/cart/list');
    const list = res || [];
    cartCount.value = list.reduce((sum, item) => sum + (item.quantity || 0), 0);
  } catch (e) {
    cartCount.value = 0;
  }
}

async function loadReviews() {
  if (detailTab.value === 'reviews' && reviews.value.length > 0) return;
  detailTab.value = 'reviews';
  if (reviews.value.length > 0) return;
  reviewsLoading.value = true;
  try {
    const res = await request.get('/product/reviews', { product_id: productId.value });
    reviews.value = (res || []).map(r => ({
      ...r,
      images: r.images ? (typeof r.images === 'string' ? r.images.split(',') : r.images) : []
    }));
  } catch (e) {
    console.error('加载评价失败', e);
  } finally {
    reviewsLoading.value = false;
  }
}

function handleAddCart() {
  if (product.value.skus?.length > 0) {
    showSkuModal('cart');
  } else {
    addToCart();
  }
}

function handleBuyNow() {
  if (product.value.skus?.length > 0) {
    showSkuModal('buy');
  } else {
    buyNow();
  }
}

function goCart() {
  uni.switchTab({ url: '/pages/cart/index' });
}

function formatTime(time) {
  if (!time) return '';
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.product-swiper {
  height: 750rpx;

  &.no-image {
    background: #f5f5f5;
  }
}

.product-image {
  width: 100%;
  height: 100%;
}

.price-section {
  padding: 30rpx;
  background: #fff;
}

.price-row {
  display: flex;
  align-items: baseline;
}

.current-price {
  font-size: 48rpx;
  color: #ff4a8d;
  font-weight: bold;
}

.original-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 16rpx;
}

.price-tag {
  margin-left: 20rpx;
  padding: 4rpx 16rpx;
  background: #ff4a8d;
  color: #fff;
  font-size: 22rpx;
  border-radius: 4rpx;
}

.product-tags {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.tag {
  padding: 4rpx 12rpx;
  background: #fdf0f5;
  color: #ff4a8d;
  font-size: 22rpx;
  border-radius: 4rpx;
}

.info-section {
  padding: 30rpx;
  background: #fff;
  margin-top: 2rpx;
}

.product-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.5;
}

.product-subtitle {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
}

.product-meta {
  display: flex;
  gap: 40rpx;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.delivery-section {
  padding: 24rpx 30rpx;
  background: #fff;
  margin-top: 2rpx;
}

.delivery-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .iconfont {
    margin-right: 12rpx;
    color: #999;
  }
}

.sku-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: #fff;
  margin-top: 20rpx;
  cursor: pointer;

  &:active {
    background: #f9f9f9;
  }
}

.sku-header {
  display: flex;
  align-items: center;
}

.sku-title {
  font-size: 28rpx;
  color: #333;
}

.sku-selected {
  font-size: 26rpx;
  color: #999;
  margin-left: 16rpx;
}

.detail-section {
  margin-top: 20rpx;
  background: #fff;
}

.detail-tabs {
  display: flex;
  border-bottom: 1rpx solid #f5f5f5;
}

.detail-tab {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #ff4a8d;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #ff4a8d;
      border-radius: 2rpx;
    }
  }
}

.detail-content {
  padding: 30rpx;
  
  rich-text {
    width: 100%;
  }
}

.specs-content {
  padding: 30rpx;
}

.specs-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.specs-label {
  width: 160rpx;
  font-size: 26rpx;
  color: #999;
}

.specs-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.reviews-content {
  padding: 30rpx;
}

.review-item {
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 30rpx;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

.review-header {
  display: flex;
  align-items: flex-start;
}

.review-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background: #f5f5f5;
}

.review-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.review-name {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.review-rating {
  display: flex;
  align-items: center;

  .iconfont.star {
    font-size: 24rpx;
    color: #ddd;
    margin-right: 4rpx;

    &.active {
      color: #ffcc00;
    }
  }

  .rating-text {
    font-size: 22rpx;
    color: #999;
    margin-left: 8rpx;
  }
}

.review-content {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-top: 16rpx;
}

.review-images {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  
  image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
  }
}

.review-time {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}

.empty-reviews {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 26rpx;
}

.loading-reviews {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 26rpx;
}

.bottom-placeholder {
  height: calc(120rpx + env(safe-area-inset-bottom));
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 30rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  box-sizing: border-box;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-icons {
  display: flex;
  align-items: center;
}

.action-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 48rpx;
  position: relative;

  .star-icon {
    font-size: 48rpx;
    color: #666;
    font-family: 'Material Symbols Outlined' !important;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;

    &.active {
      color: #ff4a8d;
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  }

  .cart-icon {
    font-size: 48rpx;
    color: #666;
    font-family: 'Material Symbols Outlined' !important;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  text {
    font-size: 20rpx;
    color: #666;
    margin-top: 6rpx;
  }

  .cart-badge {
    position: absolute;
    top: -8rpx;
    right: -20rpx;
    min-width: 36rpx;
    height: 36rpx;
    padding: 0 10rpx;
    background: #ff4a8d;
    color: #fff;
    font-size: 22rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.action-buttons {
  display: flex;
  align-items: center;
}

.btn-add-cart,
.btn-buy-now {
  padding: 0 40rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  border-radius: 36rpx;
}

.btn-add-cart {
  background: linear-gradient(135deg, #ff9500 0%, #ffb347 100%);
  color: #fff;
  margin-right: 24rpx;
}

.btn-buy-now {
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  color: #fff;
}

// SKU 弹窗
.sku-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
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
  font-size: 32rpx;
  color: #333;
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
