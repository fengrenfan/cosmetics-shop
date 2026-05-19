<template>
  <view class="page">
    <textarea
      class="editor"
      v-model="content"
      maxlength="1000"
      placeholder="分享你的美妆心得..."
      auto-height
    />

    <view class="image-grid">
      <view class="image-wrap" v-for="(image, index) in images" :key="image">
        <image class="image" :src="request.fixImageUrl(image)" mode="aspectFill" />
        <view class="remove" @click="removeImage(index)">×</view>
      </view>
      <view class="add-image" v-if="images.length < 9" @click="chooseImages">
        <uni-icons type="camera-filled" size="28" color="#c88e76"></uni-icons>
        <text>添加图片</text>
      </view>
    </view>

    <view class="footer">
      <text>{{ content.length }}/1000</text>
      <button class="publish-btn" :disabled="!canPublish || submitting" @click="publish">
        发布
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import request from '@/utils/request.js';

const content = ref('');
const images = ref([]);
const submitting = ref(false);
const canPublish = computed(() => content.value.trim().length > 0);

function chooseImages() {
  uni.chooseImage({
    count: 9 - images.value.length,
    success: async ({ tempFilePaths }) => {
      for (const filePath of tempFilePaths) {
        const url = await upload(filePath);
        images.value.push(url);
      }
    },
  });
}

function upload(filePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${request.baseUrl}/upload/image`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${uni.getStorageSync('token')}`,
      },
      success: ({ data }) => {
        const body = JSON.parse(data);
        if (body.code === 0 || body.code === 200) {
          resolve(body.data.url);
        } else {
          reject(body);
        }
      },
      fail: reject,
    });
  });
}

function removeImage(index) {
  images.value.splice(index, 1);
}

async function publish() {
  if (!canPublish.value || submitting.value) return;
  submitting.value = true;
  try {
    await request.post('/community', {
      content: content.value.trim(),
      images: images.value,
    });
    uni.showToast({ title: '发布成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 500);
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 28rpx;
  box-sizing: border-box;
  background: #fff;
}
.editor {
  width: 100%;
  min-height: 220rpx;
  font-size: 30rpx;
  line-height: 46rpx;
  color: #333;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 28rpx;
}
.image-wrap,
.add-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12rpx;
  overflow: hidden;
}
.image {
  width: 100%;
  height: 100%;
}
.remove {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-image {
  background: #f6f1ee;
  color: #c88e76;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  font-size: 24rpx;
}
.footer {
  margin-top: 36rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #999;
  font-size: 24rpx;
}
.publish-btn {
  width: 180rpx;
  margin: 0;
  border: 0;
  border-radius: 999rpx;
  background: #d99c83;
  color: #fff;
  font-size: 28rpx;
}
.publish-btn[disabled] {
  background: #e7d8d1;
  color: #fff;
}
</style>
