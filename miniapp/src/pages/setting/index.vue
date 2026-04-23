<template>
  <view class="page">
    <view class="setting-list">
      <view class="setting-item" @click="clearCache">
        <view class="item-left">
          <text class="iconfont fa-trash-can"></text>
          <text class="item-label">清除缓存</text>
        </view>
        <view class="item-right">
          <text class="arrow">></text>
        </view>
      </view>
      
      <view class="setting-item" @click="checkVersion">
        <view class="item-left">
          <text class="iconfont fa-circle-info"></text>
          <text class="item-label">版本信息</text>
        </view>
        <view class="item-right">
          <text class="version">v1.0.0</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>
    
    <view class="logout-btn" @click="logout" v-if="hasLogin">
      退出登录
    </view>
  </view>
</template>

<script>
import { clearToken } from '@/utils/auth.js';

export default {
  data() {
    return {
      hasLogin: false
    };
  },
  onShow() {
    const token = uni.getStorageSync('token');
    this.hasLogin = !!token;
  },
  methods: {
    clearCache() {
      uni.showModal({
        title: '提示',
        content: '确定要清除缓存吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync();
            uni.showToast({ title: '清除成功', icon: 'success' });
          }
        }
      });
    },
    checkVersion() {
      uni.showToast({ title: '已是最新版本', icon: 'success' });
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            clearToken();
            uni.reLaunch({ url: '/pages/login/index' });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.setting-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  .item-left {
    display: flex;
    align-items: center;
    
    .iconfont {
      font-size: 40rpx;
      margin-right: 20rpx;
      color: #ff4a8d;
    }
    
    .item-label {
      font-size: 28rpx;
      color: #333;
    }
  }
  
  .item-right {
    display: flex;
    align-items: center;
    
    .version {
      font-size: 26rpx;
      color: #999;
      margin-right: 10rpx;
    }
    
    .arrow {
      color: #ccc;
      font-size: 28rpx;
    }
  }
}

.logout-btn {
  margin-top: 60rpx;
  background: #fff;
  color: #ff4a8d;
  text-align: center;
  padding: 28rpx 0;
  border-radius: 50rpx;
  font-size: 32rpx;
}
</style>
