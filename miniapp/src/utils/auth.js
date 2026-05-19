/**
 * 微信登录工具
 */

import request from './request.js';
import { getInviterId, clearInviterId } from './inviter.js';

/**
 * 获取微信登录凭证 code
 */
export function wxLogin() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error('获取 code 失败'));
        }
      },
      fail: reject,
    });
  });
}

/**
 * 小程序端登录
 * 1. 获取 code
 * 2. 发送到后端换取 openid + token
 */
export async function login() {
  try {
    const code = await wxLogin();
    const inviter_id = getInviterId();
    const payload = { code };
    if (inviter_id) payload.inviter_id = inviter_id;

    const data = await request.post('/auth/wx-login', payload);

    request.setToken(data.token);
    uni.setStorageSync('userInfo', data.user);
    if (inviter_id) clearInviterId();

    return data;
  } catch (e) {
    console.error('登录失败', e);
    throw e;
  }
}

/** 登录请求体附带邀请人（供各登录方式复用） */
export function withInviterPayload(body) {
  const inviter_id = getInviterId();
  if (inviter_id) return { ...body, inviter_id };
  return body;
}

/**
 * 检查登录状态
 */
export function checkLogin() {
  const token = uni.getStorageSync('token');
  const userInfo = uni.getStorageSync('userInfo');
  return !!(token && userInfo);
}

/**
 * 获取用户信息（需已登录）
 */
export function getUserInfo() {
  return uni.getStorageSync('userInfo') || null;
}

/**
 * 清除 Token
 */
export function clearToken() {
  request.clearToken();
}

/**
 * 退出登录
 */
export function logout() {
  request.clearToken();
  uni.removeStorageSync('userInfo');
}
