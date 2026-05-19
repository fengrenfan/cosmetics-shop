<template>
  <view class="page">
    <view class="hero">
      <view class="hero-title-wrap">
        <view class="hero-line"></view>
        <text class="hero-title">任务中心</text>
        <view class="hero-line"></view>
      </view>
    </view>

    <view class="content">
      <!-- 签到 -->
      <view class="card checkin-card">
        <text class="card-title">签到赚积分</text>
        <view class="checkin-row">
          <view
            v-for="day in center?.checkin?.days || []"
            :key="day.date"
            class="checkin-item"
            @click="onDayClick(day)"
          >
            <view
              class="checkin-icon"
              :class="{
                missed: day.status === 'missed',
                checked: day.status === 'checked',
                today: day.status === 'today',
                upcoming: day.status === 'upcoming',
              }"
            >
              <text v-if="day.status === 'missed'" class="missed-text">漏签</text>
              <text v-else class="points-text">+{{ day.points }}</text>
            </view>
            <text class="checkin-date">{{ day.label }}</text>
          </view>
        </view>
        <view
          v-if="center?.checkin?.can_checkin"
          class="checkin-btn"
          @click="doCheckin"
        >
          立即签到 +10
        </view>
        <view v-else class="checkin-done">今日已签到</view>
      </view>

      <!-- 任务列表 -->
      <view class="card task-card">
        <text class="card-title">美点赠送</text>
        <view
          v-for="task in center?.tasks || []"
          :key="task.type"
          class="task-item"
        >
          <view class="task-icon" :class="task.type">
            <uni-icons
              :type="task.type === 'invite_register' ? 'personadd-filled' : 'chatboxes-filled'"
              size="22"
              color="#fff"
            ></uni-icons>
          </view>
          <view class="task-body">
            <text class="task-name">{{ task.title }} ({{ task.current }}/{{ task.target }})</text>
            <text class="task-desc">{{ task.description }}</text>
          </view>
          <view
            class="task-action"
            :class="{ disabled: task.completed && task.type === 'community_post' }"
            @click="onTaskAction(task)"
          >
            {{ taskActionLabel(task) }}
          </view>
        </view>
      </view>
    </view>

    <!-- 邀请二维码弹层 -->
    <view v-if="showQr" class="qr-mask" @click="showQr = false">
      <view class="qr-panel" @click.stop>
        <text class="qr-title">邀请好友扫码注册</text>
        <text class="qr-sub">邀请人ID：{{ qrData?.inviter_id }}</text>
        <image
          v-if="qrData?.qrcode_base64"
          class="qr-image"
          :src="qrData.qrcode_base64"
          mode="aspectFit"
        />
        <view v-else class="qr-empty">二维码生成中...</view>
        <view class="qr-actions">
          <view class="qr-btn outline" @click="saveQr">保存到相册</view>
          <view class="qr-btn" @click="showQr = false">关闭</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { checkLogin } from '@/utils/auth.js';
import request from '@/utils/request.js';

const center = ref(null);
const showQr = ref(false);
const qrData = ref(null);
const checkinLoading = ref(false);

onShow(() => {
  if (!checkLogin()) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  loadCenter();
});

async function loadCenter() {
  try {
    center.value = await request.get('/task/center');
  } catch (e) {
    console.error('加载任务中心失败', e);
  }
}

function taskActionLabel(task) {
  if (task.type === 'invite_register') {
    return task.completed ? '已完成' : '去完成';
  }
  if (task.completed) return '已完成';
  return '去完成';
}

function onDayClick(day) {
  if (day.status === 'today' && center.value?.checkin?.can_checkin) {
    doCheckin();
  }
}

async function doCheckin() {
  if (!center.value?.checkin?.can_checkin || checkinLoading.value) return;
  checkinLoading.value = true;
  try {
    const res = await request.post('/task/checkin');
    uni.showToast({ title: `签到成功 +${res.reward}`, icon: 'success' });
    const stored = uni.getStorageSync('userInfo') || {};
    stored.points = res.points;
    uni.setStorageSync('userInfo', stored);
    await loadCenter();
  } catch (e) {
    // request 已 toast
  } finally {
    checkinLoading.value = false;
  }
}

async function onTaskAction(task) {
  if (task.type === 'invite_register') {
    if (task.completed) return;
    try {
      qrData.value = await request.get('/task/invite-qrcode');
      showQr.value = true;
    } catch (e) {
      console.error(e);
    }
    return;
  }
  if (task.type === 'community_post') {
    if (task.completed) return;
    uni.navigateTo({ url: '/pages/community/publish' });
  }
}

function saveQr() {
  if (!qrData.value?.qrcode_base64) return;
  const base64 = qrData.value.qrcode_base64.replace(/^data:image\/\w+;base64,/, '');
  const fs = uni.getFileSystemManager();
  const path = `${uni.env.USER_DATA_PATH}/invite-qr.png`;
  fs.writeFile({
    filePath: path,
    data: base64,
    encoding: 'base64',
    success: () => {
      uni.saveImageToPhotosAlbum({
        filePath: path,
        success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: () => uni.showToast({ title: '保存失败，请授权相册', icon: 'none' }),
      });
    },
    fail: () => uni.showToast({ title: '保存失败', icon: 'none' }),
  });
}
</script>

<style lang="scss">
$primary: #ff6b95;
$primary-dark: #e85a84;
$bg: #fff5f8;

.page {
  min-height: 100vh;
  background: $bg;
}

.hero {
  height: 280rpx;
  background: linear-gradient(160deg, #ff8fab 0%, #ff6b95 55%, #ff5c8a 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 48rpx;
}

.hero-title-wrap {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.hero-line {
  width: 48rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 2rpx;
}

.hero-title {
  font-size: 48rpx;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.12em;
}

.content {
  padding: 0 24rpx 48rpx;
  margin-top: -32rpx;
}

.card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 149, 0.12);
}

.card-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.checkin-row {
  display: flex;
  justify-content: space-between;
  gap: 8rpx;
}

.checkin-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.checkin-icon {
  width: 80rpx;
  height: 88rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff0f4;

  &.missed {
    background: #f0f0f0;
    .missed-text {
      font-size: 22rpx;
      color: #999;
    }
  }

  &.checked,
  &.today,
  &.upcoming {
    background: linear-gradient(180deg, #ffe0ea 0%, #ffc4d6 100%);
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 149, 0.25);
    .points-text {
      font-size: 26rpx;
      font-weight: 700;
      color: $primary;
    }
  }

  &.today {
    border: 2rpx solid $primary;
  }
}

.checkin-date {
  font-size: 20rpx;
  color: #999;
}

.checkin-btn {
  margin-top: 28rpx;
  background: linear-gradient(90deg, $primary, $primary-dark);
  color: #fff;
  text-align: center;
  padding: 22rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.checkin-done {
  margin-top: 28rpx;
  text-align: center;
  color: #999;
  font-size: 26rpx;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.task-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.invite_register {
    background: linear-gradient(135deg, #ffb347, #ff8c42);
  }

  &.community_post {
    background: linear-gradient(135deg, #a78bfa, #7c3aed);
  }
}

.task-body {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.task-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.task-action {
  flex-shrink: 0;
  padding: 12rpx 28rpx;
  background: $primary;
  color: #fff;
  font-size: 24rpx;
  border-radius: 999rpx;

  &.disabled {
    background: #ddd;
    color: #888;
  }
}

.qr-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-panel {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.qr-sub {
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}

.qr-image {
  width: 400rpx;
  height: 400rpx;
  margin: 32rpx 0;
}

.qr-empty {
  height: 400rpx;
  line-height: 400rpx;
  color: #999;
}

.qr-actions {
  display: flex;
  gap: 20rpx;
  width: 100%;
}

.qr-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 999rpx;
  background: $primary;
  color: #fff;
  font-size: 28rpx;

  &.outline {
    background: #fff;
    color: $primary;
    border: 2rpx solid $primary;
  }
}
</style>
