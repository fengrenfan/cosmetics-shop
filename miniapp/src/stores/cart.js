import { defineStore } from 'pinia';
import request from '@/utils/request.js';

// 生成设备唯一标识（游客身份）
function getDeviceId() {
  let deviceId = uni.getStorageSync('device_id');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    uni.setStorageSync('device_id', deviceId);
  }
  return deviceId;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    list: [],
    badge: 0,
  }),

  getters: {
    checkedItems: (state) => state.list.filter((item) => item.is_checked),
    totalPrice: (state) => {
      return state.list
        .filter((item) => item.is_checked)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    checkedCount: (state) => {
      return state.list.filter((item) => item.is_checked).reduce((sum, item) => sum + item.quantity, 0);
    },
  },

  actions: {
    setList(list) {
      this.list = list;
      this.badge = list.reduce((sum, item) => sum + item.quantity, 0);
    },

    async addItem(item) {
      const deviceId = getDeviceId();
      try {
        const res = await request.post('/cart/add', {
          product_id: item.product_id,
          sku_id: item.sku_id || null,
          quantity: item.quantity || 1,
          device_id: deviceId,
        });
        await this.reloadList(deviceId);
        uni.showToast({ title: '已加入购物车', icon: 'success' });
        return res;
      } catch (e) {
        // 降级：本地存储
        this.localAddItem(item);
        uni.showToast({ title: '已加入购物车', icon: 'success' });
      }
    },

    // 本地加入购物车
    localAddItem(item) {
      const existIndex = this.list.findIndex(
        (i) => i.product_id === item.product_id && i.sku_id === item.sku_id,
      );
      if (existIndex > -1) {
        this.list[existIndex].quantity += item.quantity || 1;
      } else {
        this.list.unshift({ ...item, is_checked: true });
      }
      this.updateBadge();
      this.saveLocalCart();
    },

    async reloadList(deviceId) {
      try {
        const data = await request.get('/cart/list', { device_id: deviceId });
        const list = (data || []).map((item) => ({
          ...item,
          cover_image: request.fixImageUrl(item.cover_image),
        }));
        this.setList(list);
        uni.setStorageSync('local_cart', list);
      } catch (e) {
        console.error('加载购物车失败', e);
      }
    },

    async updateQuantity(index, quantity) {
      const item = this.list[index];
      if (!item) return;

      try {
        await request.put(`/cart/${item.id}`, { quantity });
        if (quantity <= 0) {
          this.list.splice(index, 1);
        } else {
          this.list[index].quantity = quantity;
        }
        this.updateBadge();
      } catch (e) {
        uni.showToast({ title: '更新失败', icon: 'none' });
      }
    },

    toggleChecked(index) {
      this.list[index].is_checked = !this.list[index].is_checked;
    },

    toggleAllChecked(checked) {
      this.list.forEach((item) => {
        item.is_checked = checked;
      });
    },

    async removeItem(index) {
      const item = this.list[index];
      if (!item) return;

      try {
        await request.delete(`/cart/${item.id}`);
        this.list.splice(index, 1);
        this.updateBadge();
      } catch (e) {
        // 本地删除
        this.list.splice(index, 1);
        this.updateBadge();
        this.saveLocalCart();
      }
    },

    async clearChecked() {
      const checkedItems = this.list.filter((item) => item.is_checked);
      if (checkedItems.length === 0) return;

      try {
        await request.delete('/cart/batch', {
          ids: checkedItems.map((item) => item.id),
        });
      } catch (e) {
        // 本地删除
      }
      this.list = this.list.filter((item) => !item.is_checked);
      this.updateBadge();
      this.saveLocalCart();
    },

    updateBadge() {
      this.badge = this.list.reduce((sum, item) => sum + item.quantity, 0);
      if (this.badge > 0) {
        uni.setTabBarBadge({ index: 2, text: String(this.badge) });
      } else {
        uni.removeTabBarBadge({ index: 2 });
      }
    },

    saveLocalCart() {
      uni.setStorageSync('local_cart', this.list);
    },

    loadLocalCart() {
      const list = uni.getStorageSync('local_cart') || [];
      this.setList(list);
    },
  },
});