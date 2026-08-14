/**
 * 统一请求封装
 * 基于 uni.request
 */

// 服务器API地址（小程序需完整URL，H5走代理）
// #ifdef MP-WEIXIN
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://xiaodigua.shop/api'
  : '/api';
// #endif
// #ifndef MP-WEIXIN
const BASE_URL = '/api';
// #endif
const IMG_BASE = process.env.NODE_ENV === 'production'
  ? 'https://xiaodigua.shop'
  : '';

let loadingCount = 0;

function showLoadingOnce() {
  if (loadingCount === 0) {
    uni.showLoading({ title: '加载中...', mask: true });
  }
  loadingCount++;
}

function hideLoadingOnce() {
  loadingCount--;
  if (loadingCount <= 0) {
    loadingCount = 0;
    uni.hideLoading();
  }
}

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
      showLoadingOnce();

      uni.request({
        url: this.baseUrl + url,
        method,
        data,
        header,
        success: (res) => {
          hideLoadingOnce();

          if (res.statusCode === 200 || res.statusCode === 201) {
            const body = res.data;

            // NestJS 统一响应格式: { code: 0, message: 'success', data: ... }
            if (body.code === 0 || body.code === 200) {
              resolve(body.data);
            } else if (body.code === 401 || body.statusCode === 401) {
              this.clearToken();
              uni.showToast({ title: '请先登录', icon: 'none' });
              uni.redirectTo({ url: '/pages/login/index' });
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
          hideLoadingOnce();
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

  isInvalidImageUrl(url) {
    if (!url) return true;
    const u = String(url);
    return u.includes('/static/uploads/placeholder') || u.includes('placeholder.jpg');
  }

  fixImageUrl(url, seed) {
    if (this.isInvalidImageUrl(url)) {
      return seed != null
        ? `https://picsum.photos/seed/p${seed}/400/400`
        : '';
    }
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return IMG_BASE + url;
  }

  fixImageUrls(urls, seed) {
    if (!urls || !Array.isArray(urls)) return [];
    // 处理可能为 JSON 字符串的情况
    if (typeof urls === 'string') {
      try {
        urls = JSON.parse(urls);
      } catch (e) {
        return [];
      }
    }
    return urls.map((url, i) => this.fixImageUrl(url, seed != null ? seed * 10 + i : undefined));
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
      cover_image: this.fixImageUrl(p.cover_image, p.id),
      images: this.fixImageUrls(images, p.id),
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