<template>
  <view class="city-modal" v-if="show" @click="close" @touchmove.stop.prevent>
    <view class="city-content" @click.stop @touchmove.stop>
      <!-- Header -->
      <view class="city-header">
        <text class="city-title">选择城市</text>
        <text class="city-close iconfont fa-xmark" @click="close"></text>
      </view>

      <!-- Search -->
      <view class="city-search">
        <text class="iconfont fa-search search-icon"></text>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索城市"
          @input="onSearch"
        />
        <text class="iconfont fa-xmark clear-icon" v-if="searchKeyword" @click="clearSearch"></text>
      </view>

      <!-- Location Button -->
      <view class="location-btn" @click="useLocation">
        <text class="iconfont fa-location-dot"></text>
        <text>使用定位</text>
        <view class="loading-indicator" v-if="locating">
          <text>定位中...</text>
        </view>
      </view>

      <!-- Popular Cities -->
      <view class="popular-section" v-if="!searchKeyword">
        <text class="section-title">热门城市</text>
        <view class="popular-grid">
          <view
            class="popular-item"
            :class="{ active: selectedCity?.value === city.value }"
            v-for="city in popularCities"
            :key="city.value"
            @click="selectCity(city)"
          >
            {{ city.label }}
          </view>
        </view>
      </view>

      <!-- City List -->
      <view class="city-list-section">
        <text class="section-title" v-if="!searchKeyword">全部城市</text>
        <scroll-view class="city-scroll" scroll-y>
          <view
            class="city-item"
            :class="{ active: selectedCity?.value === city.value }"
            v-for="city in filteredCities"
            :key="city.value"
            @click="selectCity(city)"
          >
            <text>{{ city.label }}</text>
            <text class="iconfont fa-check check-icon" v-if="selectedCity?.value === city.value"></text>
          </view>
          <view class="empty-result" v-if="filteredCities.length === 0 && searchKeyword">
            <text>未找到匹配的城市</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getPopularCities, getAllCities, getCurrentCity } from '@/utils/location.js';

const props = defineProps({
  show: Boolean,
  currentCity: Object,
});

const emit = defineEmits(['close', 'confirm']);

const searchKeyword = ref('');
const locating = ref(false);
const popularCities = ref([]);
const allCities = ref([]);
const selectedCity = ref(null);

onMounted(() => {
  popularCities.value = getPopularCities();
  allCities.value = getAllCities();
  if (props.currentCity) {
    selectedCity.value = props.currentCity;
  }
});

const filteredCities = computed(() => {
  if (!searchKeyword.value) {
    return allCities.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return allCities.value.filter(city =>
    city.label.toLowerCase().includes(keyword)
  );
});

function onSearch() {
}

function clearSearch() {
  searchKeyword.value = '';
}

async function useLocation() {
  locating.value = true;
  try {
    const city = await getCurrentCity();
    if (city) {
      selectedCity.value = city;
      emit('confirm', city);
      close();
    } else {
      uni.showToast({ title: '无法识别城市，请手动选择', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '定位失败', icon: 'none' });
  } finally {
    locating.value = false;
  }
}

function selectCity(city) {
  selectedCity.value = city;
  emit('confirm', city);
  close();
}

function close() {
  emit('close');
}
</script>

<style lang="scss">
.city-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
}

.city-content {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  flex-direction: column;
}

.city-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.city-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #1b1c1c;
  font-family: 'Manrope', sans-serif;
}

.city-close {
  font-size: 36rpx;
  color: #5d3f3b;
  padding: 8rpx;
}

.city-search {
  display: flex;
  align-items: center;
  margin: 24rpx 32rpx;
  padding: 0 24rpx;
  height: 72rpx;
  background: #f5f3f3;
  border-radius: 9999rpx;
  gap: 12rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #5d3f3b;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1b1c1c;
}

.clear-icon {
  font-size: 24rpx;
  color: #5d3f3b;
  padding: 8rpx;
}

.location-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin: 0 32rpx 24rpx;
  padding: 20rpx;
  background: #ffe8e8;
  border-radius: 16rpx;
  color: #bb0004;
  font-size: 28rpx;
  font-weight: 600;

  .fa-location-dot {
    font-size: 28rpx;
  }

  &:active {
    opacity: 0.8;
  }
}

.loading-indicator {
  font-size: 24rpx;
  color: #bb0004;
  margin-left: 8rpx;
}

.popular-section {
  padding: 0 32rpx 24rpx;
}

.section-title {
  font-size: 24rpx;
  color: #5d3f3b;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}

.popular-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.popular-item {
  padding: 12rpx 28rpx;
  background: #f5f3f3;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #1b1c1c;
  font-weight: 500;

  &.active {
    background: #bb0004;
    color: #fff;
  }

  &:active {
    opacity: 0.8;
  }
}

.city-list-section {
  flex: 1;
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
}

.city-scroll {
  flex: 1;
  height: 400rpx;
}

.city-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f3f3;
  font-size: 30rpx;
  color: #1b1c1c;

  &.active {
    color: #bb0004;
    font-weight: 600;
  }

  &:active {
    background: #fafafa;
  }
}

.check-icon {
  font-size: 28rpx;
  color: #bb0004;
}

.empty-result {
  padding: 48rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #5d3f3b;
}
</style>