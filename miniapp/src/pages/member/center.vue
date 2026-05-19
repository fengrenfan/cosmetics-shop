<template>
  <view class="page">
    <!-- 用户信息 -->
    <view class="profile-section">
      <view class="profile-bg"></view>
      <view class="profile-content">
        <image
          class="avatar"
          :src="profile.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="profile-info">
          <text class="nickname">{{ profile.nickname || '用户' }}</text>
          <view class="level-badge" v-if="profile.level">
            <uni-icons type="vip-filled" size="14" color="#d4a017"></uni-icons>
            <text class="level-text">{{ profile.level.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 累计下单 / 累计节省 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-value">{{ profile.order_count || 0 }}次</text>
        <text class="stats-label">累计下单</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value">{{ profile.total_savings || '0.00' }}元</text>
        <text class="stats-label">累计节省</text>
      </view>
    </view>

    <!-- 权益横幅 -->
    <view class="benefit-banner" v-if="profile.level">
      <uni-icons type="medal-filled" size="18" color="#d4a017"></uni-icons>
      <text class="benefit-text">我的权益：{{ profile.level.benefit_desc || '享受会员优惠价' }}</text>
    </view>

    <!-- 团队成长 -->
    <view class="team-card">
      <view class="team-item">
        <text class="team-num">{{ teamStats.direct_count || 0 }}</text>
        <text class="team-label">直属邀请人数</text>
      </view>
      <view class="team-item">
        <text class="team-num">{{ teamStats.second_count || 0 }}</text>
        <text class="team-label">二级邀请人数</text>
      </view>
      <view class="team-item">
        <text class="team-num">{{ teamStats.third_count || 0 }}</text>
        <text class="team-label">三级邀请人数</text>
      </view>
      <view class="team-item">
        <text class="team-num">{{ teamStats.team_total || 0 }}</text>
        <text class="team-label">团队总人数</text>
      </view>
    </view>

    <!-- 部门信息 -->
    <view class="dept-section">
      <view class="dept-header">
        <text class="dept-title">部门信息</text>
        <picker :range="periods" range-key="name" :value="periodIndex" @change="onPeriodChange">
          <view class="period-picker">
            <text>{{ currentPeriod?.name || '选择期数' }}</text>
            <uni-icons type="right" size="14" color="#999"></uni-icons>
          </view>
        </picker>
      </view>

      <view v-if="loading" class="loading-tip">加载中...</view>
      <view v-else-if="departments.length === 0" class="empty-tip">暂无部门数据</view>

      <view
        v-for="dept in departments"
        :key="dept.direct_user.id"
        class="dept-card"
        @click="goDepartmentDetail(dept)"
      >
        <view class="dept-card-header">
          <text class="dept-name">{{ dept.dept_name }}</text>
          <view class="status-tag" :class="dept.status === 1 ? 'qualified' : 'unqualified'">
            {{ dept.status_text }}
          </view>
        </view>
        <view class="direct-info">
          <text>{{ dept.direct_user.nickname }}/{{ dept.direct_user.phone || '-' }}/{{ dept.direct_user.level_name }}</text>
        </view>
        <view class="dept-metrics">
          <view class="metric-item">
            <text class="metric-value">{{ dept.total_members }}</text>
            <text class="metric-label">总人数</text>
          </view>
          <view class="metric-item">
            <text class="metric-value">{{ dept.total_performance }}</text>
            <text class="metric-label">总业绩</text>
          </view>
          <view class="metric-item">
            <text class="metric-value">{{ dept.effective_performance }}</text>
            <text class="metric-label">有效业绩</text>
          </view>
        </view>
        <uni-icons class="dept-arrow" type="right" size="16" color="#ccc"></uni-icons>
      </view>
    </view>

    <view class="bottom-safe"></view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { checkLogin } from '@/utils/auth.js';
import request from '@/utils/request.js';

const profile = ref({});
const teamStats = ref({});
const periods = ref([]);
const periodIndex = ref(0);
const departments = ref([]);
const loading = ref(false);

const currentPeriod = computed(() => periods.value[periodIndex.value] || null);

onMounted(() => {
  if (!checkLogin()) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  loadAll();
});

onShow(() => {
  if (checkLogin()) loadAll();
});

async function loadAll() {
  loading.value = true;
  try {
    const [profileData, teamData, periodList] = await Promise.all([
      request.get('/member/profile'),
      request.get('/member/team-stats'),
      request.get('/member/periods'),
    ]);
    profile.value = profileData || {};
    teamStats.value = teamData || {};
    periods.value = periodList || [];
    if (periods.value.length && periodIndex.value >= periods.value.length) {
      periodIndex.value = 0;
    }
    const activeIdx = periods.value.findIndex((p) => p.status === 1);
    if (activeIdx >= 0) periodIndex.value = activeIdx;
    await loadDepartments();
  } catch (e) {
    console.error('加载会员中心失败', e);
  } finally {
    loading.value = false;
  }
}

async function loadDepartments() {
  if (!currentPeriod.value) {
    departments.value = [];
    return;
  }
  try {
    const data = await request.get('/member/departments', {
      period_id: currentPeriod.value.id,
    });
    departments.value = data?.departments || [];
  } catch (e) {
    console.error('加载部门信息失败', e);
    departments.value = [];
  }
}

function onPeriodChange(e) {
  periodIndex.value = Number(e.detail.value);
  loadDepartments();
}

function goDepartmentDetail(dept) {
  uni.showModal({
    title: dept.dept_name,
    content: `负责人：${dept.direct_user.nickname}\n总人数：${dept.total_members}\n总业绩：${dept.total_performance}元\n有效业绩：${dept.effective_performance}元\n状态：${dept.status_text}`,
    showCancel: false,
  });
}
</script>

<style lang="scss">
$gold-dark: #8b6914;
$gold-mid: #c9a227;
$gold-light: #f5e6b8;
$orange-start: #ff8c42;
$orange-end: #ff6b35;
$surface: #f5f3f0;
$on-surface: #1b1c1c;

.page {
  min-height: 100vh;
  background: $surface;
  padding-bottom: 40rpx;
}

.profile-section {
  position: relative;
  padding: 48rpx 32rpx 80rpx;
  overflow: hidden;
}

.profile-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #a67c00 0%, #c9a227 40%, #d4af37 70%, #8b6914 100%);
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
  }
}

.profile-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24rpx;
  z-index: 1;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
  background: #fff;
}

.profile-info {
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  display: block;
  margin-bottom: 12rpx;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(0, 0, 0, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 215, 0, 0.5);
}

.level-text {
  font-size: 24rpx;
  color: $gold-light;
}

.stats-card {
  margin: -48rpx 24rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  padding: 32rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 2;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stats-value {
  font-size: 32rpx;
  font-weight: 600;
  color: $on-surface;
}

.stats-label {
  font-size: 24rpx;
  color: #999;
}

.stats-divider {
  width: 1rpx;
  background: #eee;
  align-self: stretch;
}

.benefit-banner {
  margin: 0 24rpx 24rpx;
  padding: 24rpx 28rpx;
  background: linear-gradient(90deg, #ffb347 0%, #ffcc33 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.benefit-text {
  font-size: 26rpx;
  color: #5d3f00;
  flex: 1;
}

.team-card {
  margin: 0 24rpx 32rpx;
  padding: 32rpx 16rpx;
  background: linear-gradient(135deg, $orange-start 0%, $orange-end 100%);
  border-radius: 16rpx;
  display: flex;
}

.team-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.team-num {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
}

.team-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}

.dept-section {
  padding: 0 24rpx;
}

.dept-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.dept-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $on-surface;
}

.period-picker {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 26rpx;
  color: #666;
  padding: 8rpx 16rpx;
  background: #fff;
  border-radius: 8rpx;
}

.loading-tip,
.empty-tip {
  text-align: center;
  padding: 60rpx;
  color: #999;
  font-size: 28rpx;
}

.dept-card {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.dept-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.dept-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $on-surface;
}

.status-tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;

  &.qualified {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.unqualified {
    background: #ffebee;
    color: #c62828;
  }
}

.direct-info {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dept-metrics {
  display: flex;
}

.metric-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.metric-value {
  font-size: 28rpx;
  font-weight: 600;
  color: $on-surface;
}

.metric-label {
  font-size: 22rpx;
  color: #999;
}

.dept-arrow {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
}

.bottom-safe {
  height: env(safe-area-inset-bottom);
}
</style>
