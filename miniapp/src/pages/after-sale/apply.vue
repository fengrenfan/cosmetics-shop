<template>
  <view class="page">
    <view class="form">
      <view class="form-item">
        <text class="label">退款类型</text>
        <view class="type-options">
          <view class="type-option" :class="{ active: form.type === 'refund' }" @click="form.type = 'refund'">仅退款</view>
          <view class="type-option" :class="{ active: form.type === 'return' }" @click="form.type = 'return'">退货退款</view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">退款金额</text>
        <input class="input" type="digit" v-model="form.refund_amount" :placeholder="'最多 ¥' + maxAmount" />
      </view>

      <view class="form-item">
        <text class="label">退款原因</text>
        <picker :range="reasons" @change="onReasonChange">
          <view class="picker">
            <text>{{ form.reason || '请选择退款原因' }}</text>
            <uni-icons type="right" size="14"></uni-icons>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">补充说明</text>
        <textarea class="textarea" v-model="form.description" placeholder="请输入补充说明（选填）" maxlength="500"></textarea>
      </view>

      <view class="form-item">
        <text class="label">上传凭证</text>
        <view class="image-list">
          <view class="image-item" v-for="(img, idx) in form.images" :key="idx">
            <image :src="img" mode="aspectFill"></image>
            <uni-icons type="clear" size="16" class="remove" @click="removeImage(idx)"></uni-icons>
          </view>
          <view class="add-image" @click="chooseImage" v-if="form.images.length < 9">
            <uni-icons type="plusempty" size="24" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <view class="submit-btn" @click="submit">提交申请</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const orderId = ref('');
const maxAmount = ref(0);
const form = ref({
  type: 'refund',
  refund_amount: '',
  reason: '',
  description: '',
  images: [],
});
const reasons = ['不想要了', '商品质量问题', '商品与描述不符', '收到商品损坏', '发错货', '其他'];

onLoad((options) => {
  orderId.value = options.orderId;
  maxAmount.value = parseFloat(options.amount) || 0;
  form.value.refund_amount = options.amount || '';
});

function onReasonChange(e) {
  form.value.reason = reasons[e.detail.value];
}

function chooseImage() {
  uni.chooseImage({
    count: 9 - form.value.images.length,
    sizeType: ['compressed'],
    success: (res) => {
      form.value.images.push(...res.tempFilePaths);
    },
  });
}

function removeImage(idx) {
  form.value.images.splice(idx, 1);
}

async function submit() {
  if (!form.value.reason) return uni.showToast({ title: '请选择退款原因', icon: 'none' });
  if (!form.value.refund_amount || parseFloat(form.value.refund_amount) <= 0) {
    return uni.showToast({ title: '请输入退款金额', icon: 'none' });
  }
  if (parseFloat(form.value.refund_amount) > maxAmount.value) {
    return uni.showToast({ title: '退款金额不能超过订单金额', icon: 'none' });
  }

  try {
    const token = uni.getStorageSync('token');
    const res = await uni.request({
      url: '/api/after-sales',
      method: 'POST',
      data: {
        order_id: parseInt(orderId.value),
        type: form.value.type,
        refund_amount: parseFloat(form.value.refund_amount),
        reason: form.value.reason,
        description: form.value.description,
        images: form.value.images,
      },
      header: { Authorization: `Bearer ${token}` },
    });

    if (res.data?.code === 0) {
      uni.showToast({ title: '申请已提交', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
    } else {
      uni.showToast({ title: res.data?.message || '提交失败', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' });
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; }
.form { background: #fff; margin: 24rpx; border-radius: 12rpx; padding: 24rpx; }
.form-item { margin-bottom: 32rpx; }
.label { font-size: 28rpx; color: #333; font-weight: 600; display: block; margin-bottom: 16rpx; }
.type-options { display: flex; gap: 16rpx; }
.type-option { flex: 1; text-align: center; padding: 16rpx; border: 1rpx solid #ddd; border-radius: 8rpx; font-size: 26rpx; }
.type-option.active { border-color: #bb0004; color: #bb0004; background: #fff5f5; }
.input { border: 1rpx solid #eee; border-radius: 8rpx; padding: 16rpx; font-size: 28rpx; }
.textarea { border: 1rpx solid #eee; border-radius: 8rpx; padding: 16rpx; font-size: 28rpx; width: 100%; height: 160rpx; }
.picker { display: flex; justify-content: space-between; align-items: center; border: 1rpx solid #eee; border-radius: 8rpx; padding: 16rpx; font-size: 28rpx; color: #333; }
.image-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-item { position: relative; width: 160rpx; height: 160rpx; }
.image-item image { width: 100%; height: 100%; border-radius: 8rpx; }
.image-item .remove { position: absolute; top: -8rpx; right: -8rpx; background: #fff; border-radius: 50%; }
.add-image { width: 160rpx; height: 160rpx; border: 1rpx dashed #ddd; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; }
.submit-btn { margin: 24rpx; background: #bb0004; color: #fff; text-align: center; padding: 24rpx; border-radius: 12rpx; font-size: 30rpx; }
</style>
