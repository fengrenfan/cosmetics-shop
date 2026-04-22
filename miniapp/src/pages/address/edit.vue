<template>
  <view class="page">
    <view class="form">
      <!-- 粘贴地址解析 -->
      <view class="form-item import-item" v-if="!formData.province">
        <textarea
          class="import-textarea"
          v-model="importText"
          placeholder="粘贴收货地址（如：广东省广州市天河区花城大道123号）"
        />
        <view class="btn-row">
          <view class="paste-btn" @click="pasteAndParse">
            <text class="material-symbols-outlined">content_paste</text>
            <text class="btn-text">粘贴</text>
          </view>
          <view class="parse-btn" @click="parseImportAddress" v-if="importText.trim()">
            <text class="material-symbols-outlined">auto_awesome</text>
            <text>智能识别</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="label">收货人</view>
        <input class="input" v-model="formData.name" placeholder="请输入收货人姓名" />
      </view>

      <view class="form-item">
        <view class="label">手机号码</view>
        <input class="input" v-model="formData.phone" type="number" placeholder="请输入手机号码" maxlength="11" />
      </view>

      <view class="form-item">
        <view class="label">所在地区</view>
        <picker mode="region" @change="onRegionChange" :value="region">
          <view class="picker-value">
            {{ region.length ? region.join('') : '请选择省市区' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <view class="label">详细地址</view>
        <textarea class="textarea" v-model="formData.detail_address" placeholder="请输入详细地址" />
      </view>

      <view class="form-item switch-item">
        <view class="label">设为默认地址</view>
        <switch :checked="formData.is_default" @change="onDefaultChange" />
      </view>
    </view>

    <view class="btn-save" @click="saveAddress">
      保存地址
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';
import { regionData } from '@/utils/regionData.js';

export default {
  data() {
    return {
      id: null,
      region: [],
      importText: '',
      formData: {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail_address: '',
        is_default: false
      }
    };
  },
  onLoad(options) {
    if (options.id) {
      this.id = parseInt(options.id);
      this.loadAddress();
    }
  },
  methods: {
    // 粘贴并识别
    async pasteAndParse() {
      try {
        const res = await uni.getClipboardData({});
        if (res.data) {
          this.importText = res.data;
          this.parseImportAddress();
        } else {
          uni.showToast({ title: '剪贴板为空', icon: 'none' });
        }
      } catch (e) {
        uni.showToast({ title: '读取剪贴板失败', icon: 'none' });
      }
    },
    // 粘贴地址解析（自动填充省市区）- 改进版
    parseImportAddress() {
      if (!this.importText.trim()) return;
      const text = this.importText.trim();

      // 1. 提取手机号（11位以1开头的数字）并从文本中移除
      const phoneMatch = text.match(/1\d{10}/);
      if (phoneMatch) {
        this.formData.phone = phoneMatch[0];
      }
      // 移除手机号后的文本（用于后续解析）
      let textWithoutPhone = text.replace(/1\d{10}/g, '').trim();

      // 2. 识别收货人姓名（先于省份解析，因为"XX收"可能出现在任意位置）
      let name = '';
      // 策略1：查找"XX收"格式（可能在开头或末尾）
      const receiverMatch = textWithoutPhone.match(/([一-龥]{2,10})\s*收/);
      if (receiverMatch) {
        name = receiverMatch[1];
        textWithoutPhone = textWithoutPhone.replace(/[一-龥]{2,10}\s*收/, '').trim();
      }
      // 策略2：查找开头的独立姓名（2-4个汉字，后面跟空格+地址关键词）
      if (!name) {
        const nameAtStart = textWithoutPhone.match(/^([一-龥]{2,4})\s+(1\d{10}|[一-龥]{2,10}(街|路|道|号|栋|楼|单元|室|村|巷))/);
        if (nameAtStart) {
          name = nameAtStart[1];
          textWithoutPhone = textWithoutPhone.replace(/^[一-龥]{2,4}\s+/, '').trim();
        }
      }
      // 策略3：查找手机号后面的姓名（格式：手机号 姓名）
      if (!name && this.formData.phone) {
        const phoneAfterName = text.match(/1\d{10}\s*([一-龥]{2,10})$/);
        if (phoneAfterName) {
          name = phoneAfterName[1];
        }
      }

      // 3. 构建省份简称映射
      const fullToShort = {
        '北京市': '北京', '天津市': '天津', '上海市': '上海', '重庆市': '重庆',
        '黑龙江省': '黑龙江', '内蒙古自治区': '内蒙古', '西藏自治区': '西藏', '新疆维吾尔自治区': '新疆',
        '广西壮族自治区': '广西', '宁夏回族自治区': '宁夏',
        '香港特别行政区': '香港', '澳门特别行政区': '澳门'
      };

      // 4. 从文本中查找匹配的省份（支持任意位置匹配）
      let matchedProvince = null;
      let restText = textWithoutPhone;

      for (const p of regionData) {
        const shortName = fullToShort[p.label] || p.label.slice(0, 2);
        const idx = textWithoutPhone.indexOf(p.label);
        const shortIdx = shortName ? textWithoutPhone.indexOf(shortName) : -1;

        if (idx !== -1) {
          matchedProvince = p;
          restText = textWithoutPhone.slice(idx + p.label.length);
          break;
        } else if (shortIdx !== -1 && shortName.length >= 2) {
          matchedProvince = p;
          restText = textWithoutPhone.slice(shortIdx + shortName.length);
          break;
        }
      }

      if (!matchedProvince) {
        uni.showToast({ title: '未识别出省份，请手动选择', icon: 'none' });
        return;
      }

      this.formData.province = matchedProvince.label;
      if (name) this.formData.name = name;
      this.region = [matchedProvince.label, '', ''];

      // 5. 查找匹配的市
      let matchedCity = null;
      const cities = matchedProvince.children || [];

      for (const c of cities) {
        const shortName = c.label.replace(/市|区|县$/, '');
        if (restText.startsWith(c.label) || restText.startsWith(shortName)) {
          matchedCity = c;
          restText = restText.slice(c.label.length);
          break;
        }
        const idx = restText.indexOf(c.label);
        if (idx !== -1) {
          matchedCity = c;
          restText = restText.slice(idx + c.label.length);
          break;
        }
      }

      // 6. 判断是否为直辖市/两级模式
      const isTwoLevel = cities.length > 0 && cities.every(c => c.children.length === 0);

      if (isTwoLevel) {
        this.formData.city = matchedProvince.label;
        if (matchedCity) {
          this.formData.district = matchedCity.label;
          this.region = [matchedProvince.label, matchedProvince.label, matchedCity.label];
        }
      } else {
        if (matchedCity) {
          this.formData.city = matchedCity.label;
          const districts = matchedCity.children || [];
          for (const d of districts) {
            const shortName = d.label.replace(/市|区|县$/, '');
            if (restText.startsWith(d.label) || restText.startsWith(shortName)) {
              this.formData.district = d.label;
              this.region = [matchedProvince.label, matchedCity.label, d.label];
              break;
            }
            const idx = restText.indexOf(d.label);
            if (idx !== -1) {
              this.formData.district = d.label;
              this.region = [matchedProvince.label, matchedCity.label, d.label];
              break;
            }
          }
          if (!this.formData.district) {
            this.region = [matchedProvince.label, matchedCity.label, ''];
          }
        }
      }

      // 7. 清理详细地址（去除可能残留的省市区名称）
      let detailAddr = restText.trim();
      detailAddr = detailAddr.replace(/^(市辖区|县|区)/, '').trim();
      detailAddr = detailAddr.replace(/^[，,、\s]+/, '').trim();

      // 7. 如果成功解析出省市区，填充表单
      if (this.formData.province) {
        this.formData.detail_address = detailAddr;
        this.importText = '';
        uni.showToast({ title: '地址解析成功', icon: 'success' });
      }
    },
    async loadAddress() {
      try {
        const res = await request.get(`/address/${this.id}`);
        this.formData = res;
        this.region = [res.province, res.city, res.district];
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    onRegionChange(e) {
      const [province, city, district] = e.detail.value;
      this.region = e.detail.value;
      this.formData.province = province;
      this.formData.city = city;
      this.formData.district = district;
    },
    onDefaultChange(e) {
      this.formData.is_default = e.detail.value;
    },
    async saveAddress() {
      if (!this.formData.name) {
        return uni.showToast({ title: '请输入收货人', icon: 'none' });
      }
      if (!this.formData.phone || this.formData.phone.length !== 11) {
        return uni.showToast({ title: '请输入正确手机号', icon: 'none' });
      }
      if (!this.formData.province) {
        return uni.showToast({ title: '请选择省市区', icon: 'none' });
      }
      if (!this.formData.detail_address) {
        return uni.showToast({ title: '请输入详细地址', icon: 'none' });
      }
      
      try {
        if (this.id) {
          await request.put(`/address/${this.id}`, this.formData);
        } else {
          await request.post('/address', this.formData);
        }
        uni.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (e) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.form {
  background: #fff;
  border-radius: 16rpx;
  padding: 0 30rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    width: 180rpx;
    font-size: 28rpx;
    color: #333;
  }
  
  .input {
    flex: 1;
    font-size: 28rpx;
  }
  
  .textarea {
    flex: 1;
    font-size: 28rpx;
    height: 120rpx;
  }
  
  .picker-value {
    flex: 1;
    font-size: 28rpx;
    color: #666;
  }
}

.switch-item {
  justify-content: space-between;
}

.import-item {
  display: block;
  padding: 20rpx 0;
}

.import-textarea {
  width: 100%;
  min-height: 120rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  line-height: 1.6;
}

.btn-row {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.paste-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 22rpx 0;
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b6b 100%);
  border-radius: 8rpx;
  flex-shrink: 0;

  .material-symbols-outlined {
    font-size: 28rpx;
    color: #fff;
  }

  .btn-text {
    font-size: 26rpx;
    color: #fff;
    font-weight: 600;
  }
}

.parse-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 22rpx 0;
  background: linear-gradient(135deg, #6c5ce7 0%, #a55eea 100%);
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #fff;
  font-weight: 600;

  .material-symbols-outlined {
    font-size: 28rpx;
    color: #fff;
  }
}

.btn-save {
  margin-top: 60rpx;
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b6b 100%);
  color: #fff;
  text-align: center;
  padding: 28rpx 0;
  border-radius: 50rpx;
  font-size: 32rpx;
}
</style>
