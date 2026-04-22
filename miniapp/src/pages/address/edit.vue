<template>
  <view class="page">
    <view class="form">
      <view class="form-item">
        <view class="label">收货人</view>
        <input class="input" v-model="formData.name" placeholder="请输入收货人姓名" />
      </view>
      
      <view class="form-item">
        <view class="label">手机号码</view>
        <input class="input" v-model="formData.phone" type="number" placeholder="请输入手机号码" maxlength="11" />
      </view>
      
      <view class="form-item">
        <view class="label">所在地区</view>
        <picker mode="region" @change="onRegionChange" :value="region">
          <view class="picker-value">
            {{ region.length ? region.join('') : '请选择省市区' }}
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <view class="label">详细地址</view>
        <textarea class="textarea" v-model="formData.detail_address" placeholder="请输入详细地址" />
      </view>
      
      <view class="form-item switch-item">
        <view class="label">设为默认地址</view>
        <switch :checked="formData.is_default" @change="onDefaultChange" />
      </view>
    </view>
    
    <view class="btn-save" @click="saveAddress">
      保存地址
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';

export default {
  data() {
    return {
      id: null,
      region: [],
      formData: {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail_address: '',
        is_default: false
      }
    };
  },
  onLoad(options) {
    if (options.id) {
      this.id = parseInt(options.id);
      this.loadAddress();
    }
  },
  methods: {
    async loadAddress() {
      try {
        const res = await request.get(`/address/${this.id}`);
        this.formData = res;
        this.region = [res.province, res.city, res.district];
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    onRegionChange(e) {
      const [province, city, district] = e.detail.value;
      this.region = e.detail.value;
      this.formData.province = province;
      this.formData.city = city;
      this.formData.district = district;
    },
    onDefaultChange(e) {
      this.formData.is_default = e.detail.value;
    },
    async saveAddress() {
      if (!this.formData.name) {
        return uni.showToast({ title: '请输入收货人', icon: 'none' });
      }
      if (!this.formData.phone || this.formData.phone.length !== 11) {
        return uni.showToast({ title: '请输入正确手机号', icon: 'none' });
      }
      if (!this.formData.province) {
        return uni.showToast({ title: '请选择省市区', icon: 'none' });
      }
      if (!this.formData.detail_address) {
        return uni.showToast({ title: '请输入详细地址', icon: 'none' });
      }
      
      try {
        if (this.id) {
          await request.put(`/address/${this.id}`, this.formData);
        } else {
          await request.post('/address', this.formData);
        }
        uni.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (e) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
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

.form {
  background: #fff;
  border-radius: 16rpx;
  padding: 0 30rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    width: 180rpx;
    font-size: 28rpx;
    color: #333;
  }
  
  .input {
    flex: 1;
    font-size: 28rpx;
  }
  
  .textarea {
    flex: 1;
    font-size: 28rpx;
    height: 120rpx;
  }
  
  .picker-value {
    flex: 1;
    font-size: 28rpx;
    color: #666;
  }
}

.switch-item {
  justify-content: space-between;
}

.btn-save {
  margin-top: 60rpx;
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b6b 100%);
  color: #fff;
  text-align: center;
  padding: 28rpx 0;
  border-radius: 50rpx;
  font-size: 32rpx;
}
</style>
