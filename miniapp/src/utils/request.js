/**
 * 统一请求封装
 * 基于 uni.request
 */

// 服务器API地址（开发阶段走 Vite 代理到 localhost:3000）
const BASE_URL = '/api';
const IMG_BASE = 'http://118.25.192.73';

class Request {
  constructor() {
    this.baseUrl = BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    uni.setStorageSync('token', token);
  }

  getToken() {
    if (!this.token) {
      this.token = uni.getStorageSync('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    uni.removeStorageSync('token');
  }

  request(options) {
    const { url, method = 'GET', data = {}, header = {} } = options;

    // 添加 Token
    const token = this.getToken();
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    // 添加 Device ID（游客识别）
    let deviceId = uni.getStorageSync('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      uni.setStorageSync('device_id', deviceId);
    }
    header['x-device-id'] = deviceId;
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      uni.showLoading({ title: '加载中...', mask: true });

      uni.request({
        url: this.baseUrl + url,
        method,
        data,
        header,
        success: (res) => {
          uni.hideLoading();

          if (res.statusCode === 200 || res.statusCode === 201) {
            if (res.data.code === 0 || res.data.code === 200) {
              resolve(res.data.data);
            } else if (res.data.code === 401) {
              this.clearToken();
              uni.showToast({ title: '请先登录', icon: 'none' });
              uni.navigateTo({ url: '/pages/login/index' });
              reject(res.data);
            } else {
              uni.showToast({ title: res.data.message || '请求失败', icon: 'none' });
              reject(res.data);
            }
          } else {
            uni.showToast({ title: '网络请求失败', icon: 'none' });
            reject(res.data);
          }
        },
        fail: (err) => {
          uni.hideLoading();
          uni.showToast({ title: '网络错误', icon: 'none' });
          reject(err);
        },
      });
    });
  }

  get(url, data) {
    return this.request({ url, method: 'GET', data });
  }

  post(url, data) {
    return this.request({ url, method: 'POST', data });
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data });
  }

  delete(url, data) {
    return this.request({ url, method: 'DELETE', data });
  }

  fixImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return IMG_BASE + url;
  }

  fixImageUrls(urls) {
    if (!urls || !Array.isArray(urls)) return [];
    return urls.map(url => this.fixImageUrl(url));
  }
}

export default new Request();