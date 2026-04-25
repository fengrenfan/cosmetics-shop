<template>
  <view class="page">
    <!-- 背景 -->
    <view class="bg-section">
      <view class="logo-area">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-name">唯伊美妆</text>
        <text class="app-slogan">美妆好物 精致生活</text>
      </view>
    </view>

    <!-- 登录区域 -->
    <view class="login-section">
      <view class="login-title">欢迎回来</view>
      
      <!-- 微信一键登录 -->
      <button class="btn-wechat" @click="handleWxLogin" :loading="loading">
        <text class="iconfont fa-weixin"></text>
        <text>微信一键登录</text>
      </button>
      
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line"></view>
      </view>
      
      <!-- 开发模式登录 -->
      <view class="dev-login" v-if="isDevMode">
        <view class="dev-title">开发模式</view>
        <view class="btn-dev-login" @click="handleDevLogin">
          <text class="iconfont fa-flask"></text>
          <text>模拟登录（测试用户）</text>
        </view>
      </view>

      <!-- 手机号登录 -->
      <view class="phone-login">
        <button class="btn-phone" @click="showPhoneLogin = true">
          <text class="iconfont fa-phone"></text>
          <text>手机号登录</text>
        </button>
      </view>
      
      <!-- 协议 -->
      <view class="agreement">
        <view class="checkbox" :class="{ checked: agreed }" @click="agreed = !agreed">
          <text class="iconfont fa-check" v-if="agreed"></text>
        </view>
        <text class="agreement-text">
          登录即表示同意
          <text class="link" @click.stop="showAgreement('user')">《用户协议》</text>
          和
          <text class="link" @click.stop="showAgreement('privacy')">《隐私政策》</text>
        </text>
      </view>
    </view>

    <!-- 手机号登录弹窗 -->
    <view class="modal" v-if="showPhoneLogin" @click="showPhoneLogin = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text>手机号登录</text>
          <text class="iconfont fa-xmark" @click="showPhoneLogin = false"></text>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <input class="form-input" v-model="phoneForm.phone" type="number" maxlength="11" placeholder="请输入手机号" />
          </view>
          <view class="form-item">
            <input class="form-input code-input" v-model="phoneForm.code" type="number" maxlength="4" placeholder="请输入验证码" />
            <view class="code-btn" :class="{ disabled: countdown > 0 }" @click="sendCode">
              <text v-if="countdown === 0">获取验证码</text>
              <text v-else>{{ countdown }}s</text>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="btn-login" :class="{ disabled: !canPhoneLogin }" @click="handlePhoneLogin">登录</view>
        </view>
      </view>
    </view>

    <!-- 协议弹窗 -->
    <view class="modal" v-if="showAgreementModal" @click="showAgreementModal = false">
      <view class="modal-content agreement-modal" @click.stop>
        <view class="modal-header">
          <text>{{ agreementTitle }}</text>
          <text class="iconfont fa-xmark" @click="showAgreementModal = false"></text>
        </view>
        <scroll-view class="agreement-content" scroll-y>
          <text>{{ agreementContent }}</text>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import request from '@/utils/request.js';
import { login as doLogin } from '@/utils/auth.js';

const loading = ref(false);
const agreed = ref(true);
const showPhoneLogin = ref(false);
const showAgreementModal = ref(false);
const agreementTitle = ref('');
const agreementContent = ref('');
const countdown = ref(0);
let countdownTimer = null;

// 开发模式标志（可根据环境变量动态控制）
const isDevMode = ref(true);

const phoneForm = ref({
  phone: '',
  code: ''
});

const canPhoneLogin = computed(() => {
  return phoneForm.value.phone.length === 11 && phoneForm.value.code.length === 4;
});

async function handleWxLogin() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' });
    return;
  }

  loading.value = true;

  try {
    // 获取微信登录凭证
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => resolve(res),
        fail: reject
      });
    });

    // 调用后端登录接口
    const res = await request.post('/auth/wx-login', { code: loginRes.code });
    
    // 保存 token 和用户信息
    request.setToken(res.token);
    uni.setStorageSync('userInfo', res.user);
    uni.setStorageSync('user_id', res.user.id);
    
    uni.showToast({ title: '登录成功', icon: 'success' });
    // 返回上一页或跳转到首页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 800);
  } catch (e) {
    console.error('微信登录失败', e);
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function sendCode() {
  if (countdown.value > 0) return;
  
  if (!phoneForm.value.phone || phoneForm.value.phone.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }

  try {
    await request.post('/auth/send-code', { phone: phoneForm.value.phone });
    uni.showToast({ title: '验证码已发送', icon: 'success' });
    
    countdown.value = 60;
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownTimer);
      }
    }, 1000);
  } catch (e) {
    uni.showToast({ title: e?.message || '发送失败', icon: 'none' });
  }
}

async function handlePhoneLogin() {
  if (!canPhoneLogin.value) return;

  try {
    const res = await request.post('/auth/phone-login', {
      phone: phoneForm.value.phone,
      code: phoneForm.value.code,
    });

    request.setToken(res.token);
    uni.setStorageSync('userInfo', res.user);
    uni.setStorageSync('user_id', res.user.id);
    uni.showToast({ title: '登录成功', icon: 'success', duration: 800 });
    showPhoneLogin.value = false;
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 500);
  } catch (e) {
    uni.showToast({ title: e?.message || '登录失败', icon: 'none' });
  }
}

// 开发模式模拟登录（调用真实接口获取 JWT token）
async function handleDevLogin() {
  try {
    // 调用后端手机号登录接口（开发环境验证码固定为 1234）
    const res = await request.post('/auth/phone-login', {
      phone: '13800138000',
      code: '1234',
    });

    request.setToken(res.token);
    uni.setStorageSync('userInfo', res.user);
    uni.setStorageSync('user_id', res.user.id);
    uni.showToast({ title: '模拟登录成功', icon: 'success' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 800);
  } catch (e) {
    uni.showToast({ title: '模拟登录失败: ' + (e?.message || '未知错误'), icon: 'none' });
  }
}

function showAgreement(type) {
  if (type === 'user') {
    agreementTitle.value = '用户协议';
    agreementContent.value = `
唯伊美妆用户协议

一、服务条款的确认和接纳
1. 本应用所有权和运营权归唯伊美妆所有。
2. 用户在使用本应用服务时，应遵守以下条款。

二、用户信息
1. 用户应如实提供注册信息。
2. 用户不得以虚假信息骗取账号注册。
3. 用户账号密码安全由用户自己负责。

三、隐私保护
1. 我们尊重用户的隐私权。
2. 未经用户同意，我们不会向第三方披露用户信息。
3. 用户同意后，我们方可使用用户信息。

四、服务变更
1. 我们有权随时变更服务内容。
2. 变更内容将通过应用内公告通知用户。

五、免责声明
1. 用户因使用本应用造成的任何损失，我们不承担责任。
2. 用户应遵守当地法律法规使用本应用。

六、协议修改
1. 我们有权随时修改本协议。
2. 继续使用服务即表示同意修改后的协议。
    `;
  } else {
    agreementTitle.value = '隐私政策';
    agreementContent.value = `
唯伊美妆隐私政策

一、信息收集
1. 我们收集您在使用服务时主动提供的信息。
2. 我们收集您使用服务时自动获取的信息，如设备信息、日志等。

二、信息使用
1. 我们使用信息提供和改进服务。
2. 我们使用信息进行数据分析。
3. 我们使用信息推送个性化内容。

三、信息共享
1. 未经同意，我们不会与第三方共享用户信息。
2. 法律要求时，我们可能披露用户信息。

四、信息安全
1. 我们采用多种安全措施保护用户信息。
2. 用户也应保护好自己的账号信息。

五、Cookie使用
1. 我们使用Cookie提升用户体验。
2. 用户可关闭Cookie但可能影响部分功能。

六、未成年人保护
1. 我们非常重视对未成年人信息的保护。
2. 未成年人使用服务应获得监护人同意。

七、联系我们
如有任何问题，请联系客服：400-888-8888
    `;
  }
  showAgreementModal.value = true;
}

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f8 0%, #fff 100%);
}

.bg-section {
  height: 500rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  border-radius: 0 0 100rpx 100rpx;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 40rpx;
  background: #fff;
  margin-bottom: 24rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-section {
  padding: 60rpx 40rpx 40rpx;
}

.login-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 60rpx;
}

.btn-wechat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  background: #07c160;
  color: #fff;
  border-radius: 48rpx;
  font-size: 32rpx;
  border: none;
  
  .iconfont {
    font-size: 48rpx;
    margin-right: 12rpx;
  }
  
  &::after {
    border: none;
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 60rpx 0;
}

// 开发模式
.dev-login {
  margin-bottom: 40rpx;
}

.dev-title {
  font-size: 24rpx;
  color: #ff4a8d;
  text-align: center;
  margin-bottom: 20rpx;
  font-weight: bold;
}

.btn-dev-login {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  background: #fff;
  color: #ff4a8d;
  border-radius: 48rpx;
  font-size: 32rpx;
  border: 2rpx dashed #ff4a8d;

  .iconfont {
    font-size: 40rpx;
    margin-right: 12rpx;
  }
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: #e5e5e5;
}

.divider-text {
  padding: 0 24rpx;
  font-size: 24rpx;
  color: #999;
}

.btn-phone {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  background: #fff;
  color: #333;
  border-radius: 48rpx;
  font-size: 32rpx;
  border: 2rpx solid #ff4a8d;
  
  .iconfont {
    font-size: 48rpx;
    margin-right: 12rpx;
    color: #ff4a8d;
  }
  
  &::after {
    border: none;
  }
}

.agreement {
  display: flex;
  align-items: flex-start;
  margin-top: 40rpx;
  padding: 0 20rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  margin-top: 4rpx;
  
  &.checked {
    background: #ff4a8d;
    border-color: #ff4a8d;
    color: #fff;
  }
  
  .iconfont {
    font-size: 24rpx;
  }
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.link {
  color: #ff4a8d;
}

// 手机号登录弹窗
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  text:first-child {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .iconfont {
    font-size: 40rpx;
    color: #999;
  }
}

.modal-body {
  padding: 30rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.form-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  
  &.code-input {
    flex: 1;
  }
}

.code-btn {
  padding: 16rpx 24rpx;
  background: #ff4a8d;
  color: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
  
  &.disabled {
    background: #ccc;
  }
}

.modal-footer {
  padding: 20rpx 30rpx 30rpx;
}

.btn-login {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  
  &.disabled {
    background: #ccc;
  }
}

// 协议弹窗
.agreement-modal {
  width: 600rpx;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.agreement-content {
  flex: 1;
  padding: 30rpx;
  max-height: 500rpx;
  
  text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}
</style>
