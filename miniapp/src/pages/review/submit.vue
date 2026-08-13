<template>
  <view class="page">
    <view class="empty-state">
      <text>评价功能开发中...</text>
      <view class="back-btn" @click="goBack">返回</view>
    </view>
  </view>
</template>

<script setup>
function goBack() {
  uni.navigateBack();
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
.empty-state { text-align: center; }
.back-btn { margin-top: 30rpx; padding: 16rpx 48rpx; background: #bb0004; color: #fff; border-radius: 8rpx; font-size: 28rpx; }
</style>
