import { createPinia } from 'pinia';
import { defineStore } from 'pinia';
import { checkLogin, getUserInfo, logout as doLogout } from '@/utils/auth.js';

const pinia = createPinia();

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userInfo: null,
    profile: null,
  }),

  actions: {
    // 初始化 - 检查登录状态
    init() {
      this.isLoggedIn = checkLogin();
      this.userInfo = getUserInfo();
    },

    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      this.isLoggedIn = !!userInfo;
      if (userInfo) {
        uni.setStorageSync('userInfo', userInfo);
      }
    },

    // 设置完整 Profile
    setProfile(profile) {
      this.profile = profile;
    },

    // 退出登录
    logout() {
      doLogout();
      this.isLoggedIn = false;
      this.userInfo = null;
      this.profile = null;
    },

    // 获取用户信息
    getUserInfo() {
      return this.userInfo;
    },
  },
});

export { pinia };
