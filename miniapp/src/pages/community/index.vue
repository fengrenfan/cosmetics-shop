<template>
  <view class="page">
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-inner">
        <text class="nav-title">美圈</text>
      </view>
    </view>

    <scroll-view
      class="feed"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="refresh"
      @scrolltolower="loadMore"
    >
      <view class="post-card" v-for="post in posts" :key="post.id">
        <view class="post-head">
          <image class="avatar" :src="avatarUrl(post.user.avatar)" mode="aspectFill" />
          <view class="author-meta">
            <text class="author-name">{{ post.user.nickname }}</text>
          </view>
        </view>

        <text class="post-content">{{ post.content }}</text>

        <view class="image-grid" :class="`count-${Math.min(post.images.length, 3)}`" v-if="post.images.length">
          <image
            v-for="(image, index) in post.images"
            :key="image"
            class="post-image"
            :src="request.fixImageUrl(image)"
            mode="aspectFill"
            @click="preview(post.images, index)"
          />
        </view>

        <view class="post-foot">
          <text class="post-time">{{ formatTime(post.created_at) }}</text>
          <view class="like-btn" :class="{ liked: post.is_liked }" @click="toggleLike(post)">
            <uni-icons :type="post.is_liked ? 'hand-up-filled' : 'hand-up'" size="18"></uni-icons>
            <text v-if="post.like_count > 0">{{ post.like_count }}</text>
          </view>
        </view>
      </view>

      <view class="empty" v-if="!loading && posts.length === 0">
        <text>还没有动态，来发布第一条吧</text>
      </view>

      <view class="load-more" v-if="posts.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
      </view>
      <view class="bottom-safe"></view>
    </scroll-view>

    <view class="publish-fab" @click="goPublish">
      <uni-icons type="camera-filled" size="24" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import { checkLogin } from '@/utils/auth.js';

const statusBarHeight = ref(20);
const posts = ref([]);
const page = ref(1);
const pageSize = 10;
const loading = ref(false);
const refreshing = ref(false);
const noMore = ref(false);

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
});

onShow(() => {
  if (!checkLogin()) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  reset();
  loadPosts();
});

function reset() {
  page.value = 1;
  noMore.value = false;
  posts.value = [];
}

async function loadPosts(append = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await request.get('/community/list', { page: page.value, pageSize });
    const list = res?.list || [];
    posts.value = append ? [...posts.value, ...list] : list;
    noMore.value = list.length < pageSize;
  } finally {
    loading.value = false;
  }
}

async function refresh() {
  refreshing.value = true;
  reset();
  await loadPosts();
  refreshing.value = false;
}

function loadMore() {
  if (loading.value || noMore.value) return;
  page.value++;
  loadPosts(true);
}

async function toggleLike(post) {
  const res = await request.post(`/community/${post.id}/like`);
  post.is_liked = res.is_liked;
  post.like_count = res.like_count;
}

function goPublish() {
  uni.navigateTo({ url: '/pages/community/publish' });
}

function avatarUrl(url) {
  return url ? request.fixImageUrl(url) : '/static/default-avatar.png';
}

function preview(images, current) {
  uni.previewImage({
    urls: images.map((image) => request.fixImageUrl(image)),
    current,
  });
}

function formatTime(time) {
  const date = new Date(time);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f7f7;
}
.nav-bar {
  background: #fff;
  flex-shrink: 0;
}
.nav-inner {
  height: 96rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
}
.feed {
  flex: 1;
  height: 0;
  padding: 20rpx;
  box-sizing: border-box;
}
.post-card {
  padding: 28rpx 24rpx 22rpx;
  margin-bottom: 20rpx;
  border-radius: 18rpx;
  background: #fff;
}
.post-head {
  display: flex;
  align-items: center;
}
.avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #f1ece9;
}
.author-meta {
  margin-left: 18rpx;
}
.author-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}
.post-content {
  display: block;
  margin: 18rpx 0 18rpx 94rpx;
  color: #676b73;
  font-size: 29rpx;
  line-height: 44rpx;
}
.image-grid {
  display: grid;
  gap: 12rpx;
  margin-left: 94rpx;
  &.count-1 { grid-template-columns: 220rpx; }
  &.count-2 { grid-template-columns: repeat(2, 180rpx); }
  &.count-3 { grid-template-columns: repeat(3, 1fr); }
}
.post-image {
  width: 100%;
  height: 176rpx;
  border-radius: 10rpx;
  background: #f4f4f4;
}
.count-1 .post-image {
  height: 220rpx;
}
.post-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 22rpx 0 0 94rpx;
}
.post-time {
  color: #747980;
  font-size: 24rpx;
}
.like-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: #999;
  min-width: 54rpx;
  justify-content: flex-end;
  &.liked {
    color: #d99c83;
  }
}
.empty,
.load-more {
  padding: 48rpx 0;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}
.bottom-safe {
  height: 30rpx;
}
.publish-fab {
  position: fixed;
  right: 28rpx;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #d99c83;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(217, 156, 131, 0.28);
}
</style>
