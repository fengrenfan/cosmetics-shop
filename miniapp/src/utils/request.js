/**
 * 统一请求封装
 * 基于 uni.request
 */

// 服务器API地址（开发阶段走 Vite 代理到 NestJS 服务器）
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
            const body = res.data;

            // NestJS 统一响应格式: { code: 0, message: 'success', data: ... }
            if (body.code === 0 || body.code === 200) {
              resolve(body.data);
            } else if (body.code === 401 || body.statusCode === 401) {
              this.clearToken();
              uni.showToast({ title: '请先登录', icon: 'none' });
              uni.navigateTo({ url: '/pages/login/index' });
              reject(body);
            } else {
              uni.showToast({ title: body.message || '请求失败', icon: 'none' });
              reject(body);
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
    // 处理可能为 JSON 字符串的情况
    if (typeof urls === 'string') {
      try {
        urls = JSON.parse(urls);
      } catch (e) {
        return [];
      }
    }
    return urls.map(url => this.fixImageUrl(url));
  }

  // 标准化商品数据格式
  normalizeProduct(p) {
    let images = p.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        images = [];
      }
    }
    if (!Array.isArray(images)) {
      images = [];
    }

    return {
      id: p.id,
      title: p.title || '',
      subtitle: p.subtitle || '',
      cover_image: this.fixImageUrl(p.cover_image),
      images: images.map(img => this.fixImageUrl(img)),
      price: parseFloat(p.price) || 0,
      original_price: p.original_price ? parseFloat(p.original_price) : 0,
      stock: p.stock || 0,
      sales_count: p.sales_count || 0,
      view_count: p.view_count || 0,
      is_new: !!p.is_new,
      is_hot: !!p.is_hot,
      is_recommend: !!p.is_recommend,
      is_seckill: !!p.is_seckill,
      status: p.status,
      category: p.category,
      skus: (p.skus || []).map(sku => ({
        ...sku,
        price: parseFloat(sku.price) || 0,
        image: this.fixImageUrl(sku.image)
      }))
    };
  }
}

export default new Request();