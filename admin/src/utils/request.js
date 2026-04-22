import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 设置 Token
request.setToken = (token) => {
  localStorage.setItem('admin_token', token);
};

// 清除 Token
request.clearToken = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('adminUser');
};

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 0 && res.code !== 200) {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message));
    }
    return res.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      request.clearToken();
      window.location.href = '/login';
    } else {
      ElMessage.error(error.response?.data?.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

// 修复图片URL
const IMG_BASE = 'http://118.25.192.73';
request.fixImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return IMG_BASE + url;
};

export default request;
