<template>
  <view class="page">
    <!-- 顶部导航 -->
    <header class="nav-header">
      <view class="nav-inner">
        <view class="nav-left" @click="goBack">
          <text class="material-symbols-outlined nav-back">arrow_back</text>
        </view>
        <text class="nav-title">收货地址</text>
        <view class="nav-right" @click="addAddress">
          <text class="material-symbols-outlined nav-add">add</text>
        </view>
      </view>
    </header>

    <!-- 地址列表 -->
    <view class="address-list" v-if="addressList.length > 0">
      <view
        class="address-item"
        v-for="item in addressList"
        :key="item.id"
        :class="{ 'is-default': item.is_default }"
      >
        <!-- 点击选中区域 -->
        <view class="address-main" @click="selectAddress(item)">
          <view class="address-left">
            <view class="address-info">
              <text class="address-name">{{ item.name }}</text>
              <text class="address-phone">{{ item.phone }}</text>
              <view class="address-tag" v-if="item.is_default">默认</view>
            </view>
            <view class="address-detail">
              {{ item.province }} {{ item.city }} {{ item.district }} {{ item.detail_address }}
            </view>
          </view>
          <view class="address-check" @click.stop="selectAddress(item)">
            <view class="check-circle" :class="{ checked: selectedId === item.id }">
              <text class="iconfont-check" v-if="selectedId === item.id">✓</text>
            </view>
          </view>
        </view>

        <!-- 操作栏 -->
        <view class="address-actions">
          <view class="action-btn" @click.stop="setDefault(item)" v-if="!item.is_default">
            <text class="material-symbols-outlined action-icon">star</text>
            <text>设为默认</text>
          </view>
          <view class="action-btn" @click.stop="editAddress(item)">
            <text class="material-symbols-outlined action-icon">edit</text>
            <text>编辑</text>
          </view>
          <view class="action-btn danger" @click.stop="deleteAddress(item)">
            <text class="material-symbols-outlined action-icon">delete</text>
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="addressList.length === 0 && !loading">
      <view class="empty-icon-wrap">
        <text class="material-symbols-outlined empty-icon">location_off</text>
      </view>
      <text class="empty-title">暂无收货地址</text>
      <text class="empty-sub">添加收货地址以便快速下单</text>
      <view class="empty-btn" @click="addAddress">添加收货地址</view>
    </view>

    <!-- loading -->
    <view class="loading-state" v-if="loading">
      <view class="loading-spinner"></view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder" v-if="addressList.length > 0"></view>

    <!-- 底部添加按钮 -->
    <view class="add-btn-wrap" v-if="addressList.length > 0" @click="addAddress">
      <view class="add-btn">
        <text class="material-symbols-outlined add-icon">add</text>
        <text>添加新地址</text>
      </view>
    </view>

    <!-- 编辑/新增底部弹窗 -->
    <view class="modal-mask" v-if="showEditModal" @click="closeModal">
      <view class="modal-sheet" @click.stop>
        <!-- 拖动条 -->
        <view class="sheet-handle"></view>

        <!-- 头部 -->
        <view class="sheet-header">
          <text class="sheet-title">{{ isEdit ? '编辑地址' : '新增地址' }}</text>
          <text class="material-symbols-outlined sheet-close" @click="closeModal">close</text>
        </view>

        <!-- 表单 -->
        <view class="sheet-body">
          <!-- 粘贴地址解析 -->
          <view class="form-item form-import" v-if="!formData.province">
            <textarea
              class="import-textarea"
              v-model="importText"
              placeholder="粘贴收货地址（如：广东省广州市天河区花城大道123号）"
              placeholder-class="ph-color"
            />
            <view class="btn-row">
              <view class="import-btn" @click="pasteAndParse">
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
            <text class="form-label">收货人</text>
            <input class="form-input" v-model="formData.name" placeholder="请输入收货人姓名" placeholder-class="ph-color" />
          </view>
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input class="form-input" v-model="formData.phone" type="number" placeholder="请输入手机号" maxlength="11" placeholder-class="ph-color" />
          </view>
          <view class="form-item">
            <text class="form-label">所在地区</text>
            <picker
              mode="multiSelector"
              @change="onRegionChange"
              @columnchange="onRegionColumnChange"
              :value="regionIndex"
              :range="[regionCol1, regionCol2, regionCol3]"
              :range-key="'label'"
            >
              <view class="picker-value" :class="{ empty: !formData.province }">
                <text v-if="formData.province">{{ formData.province }} {{ formData.city }} {{ formData.district }}</text>
                <text v-else>请选择省市区</text>
                <text class="material-symbols-outlined picker-arrow">chevron_right</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">详细地址</text>
            <input class="form-input" v-model="formData.detail_address" placeholder="请输入详细地址" placeholder-class="ph-color" />
          </view>
          <view class="form-item form-switch">
            <text class="form-label">设为默认地址</text>
            <view class="switch-wrap">
              <switch :checked="formData.is_default" @change="onDefaultChange" color="#bb0004" />
            </view>
          </view>
        </view>

        <!-- 底部保存 -->
        <view class="sheet-footer">
          <view class="btn-cancel" @click="closeModal">取消</view>
          <view class="btn-confirm" @click="submitAddress">
            <text>保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '@/utils/request.js';
import { regionData, getRegionColumns, getCities, getDistricts } from '@/utils/regionData.js';

const addressList = ref([]);
const loading = ref(false);
const showEditModal = ref(false);
const isEdit = ref(false);
const selectedId = ref(null);
const fromPage = ref('');

// 三级联动选择器数据
const regionCol1 = ref([]);
const regionCol2 = ref([]);
const regionCol3 = ref([]);
const regionIndex = ref([0, 0, 0]);
// 直辖市/无中间城市的省份用两列模式
const regionTwoLevel = ref(false);
const importText = ref('');

const formData = ref({
  id: null,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  is_default: false
});

onShow(() => {
  loadAddressList();
});

function goBack() {
  uni.navigateBack();
}

// 粘贴并识别
async function pasteAndParse() {
  try {
    const res = await uni.getClipboardData({});
    if (res.data) {
      importText.value = res.data;
      parseImportAddress();
    } else {
      uni.showToast({ title: '剪贴板为空', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '读取剪贴板失败', icon: 'none' });
  }
}

// 粘贴地址解析（自动填充省市区）- 改进版
function parseImportAddress() {
  if (!importText.value.trim()) return;
  const text = importText.value.trim();

  // 1. 提取手机号（11位以1开头的数字）并从文本中移除
  const phoneMatch = text.match(/1\d{10}/);
  if (phoneMatch) {
    formData.value.phone = phoneMatch[0];
  }
  // 移除手机号后的文本（用于后续解析）
  let textWithoutPhone = text.replace(/1\d{10}/g, '').trim();

  // 2. 识别收货人姓名（先于省份解析，因为"XX收"可能出现在任意位置）
  let name = '';
  // 策略1：查找"XX收"格式（可能在开头或末尾，如"张三收"或"张三 收"）
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
  if (!name && formData.value.phone) {
    const phoneAfterName = text.match(/1\d{10}\s*([一-龥]{2,10})$/);
    if (phoneAfterName) {
      name = phoneAfterName[1];
    }
  }

  // 3. 构建省份简称映射（支持模糊匹配）
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

    // 优先匹配全称，其次匹配简称
    if (idx !== -1) {
      matchedProvince = p;
      // 找到匹配位置，截取省之后的文本
      restText = textWithoutPhone.slice(idx + p.label.length);
      break;
    } else if (shortIdx !== -1 && shortName.length >= 2) {
      // 简称匹配（仅当简称长度>=2时）
      matchedProvince = p;
      restText = textWithoutPhone.slice(shortIdx + shortName.length);
      break;
    }
  }

  if (!matchedProvince) {
    uni.showToast({ title: '未识别出省份，请手动选择', icon: 'none' });
    return;
  }

  formData.value.province = matchedProvince.label;
  if (name) formData.value.name = name;

  // 4. 查找匹配的市
  let matchedCity = null;
  const cities = matchedProvince.children || [];

  for (const c of cities) {
    const shortName = c.label.replace(/市|区|县$/, '');
    // 检查是否以市名开头或包含市名
    if (restText.startsWith(c.label) || restText.startsWith(shortName)) {
      matchedCity = c;
      restText = restText.slice(c.label.length);
      break;
    }
    // 尝试在文本中查找
    const idx = restText.indexOf(c.label);
    if (idx !== -1) {
      matchedCity = c;
      restText = restText.slice(idx + c.label.length);
      break;
    }
  }

  // 5. 判断是否为直辖市/两级模式
  const isTwoLevel = cities.length > 0 && cities.every(c => c.children.length === 0);

  if (isTwoLevel) {
    // 直辖市模式：city = 省份名，district = 选中的区
    formData.value.city = matchedProvince.label;
    if (matchedCity) {
      formData.value.district = matchedCity.label;
    }
  } else {
    // 三级模式：查找区县
    if (matchedCity) {
      formData.value.city = matchedCity.label;
      const districts = matchedCity.children || [];
      for (const d of districts) {
        const shortName = d.label.replace(/市|区|县$/, '');
        if (restText.startsWith(d.label) || restText.startsWith(shortName)) {
          formData.value.district = d.label;
          break;
        }
        const idx = restText.indexOf(d.label);
        if (idx !== -1) {
          formData.value.district = d.label;
          break;
        }
      }
    } else {
      // 没找到市，尝试直接找区县
      for (const c of cities) {
        if (c.children?.length > 0) {
          for (const d of c.children) {
            const shortName = d.label.replace(/市|区|县$/, '');
            if (restText.startsWith(d.label) || restText.startsWith(shortName)) {
              formData.value.city = c.label;
              formData.value.district = d.label;
              break;
            }
          }
          if (formData.value.district) break;
        }
      }
    }
  }

  // 6. 清理详细地址（去除可能残留的省市区名称）
  let detailAddr = restText.trim();
  // 去除可能开头的市辖区、县等
  detailAddr = detailAddr.replace(/^(市辖区|市辖区|县|区)/, '').trim();
  // 去除可能残留的门牌号等格式问题
  detailAddr = detailAddr.replace(/^[，,、\s]+/, '').trim();

  // 7. 如果成功解析出省市区，填充表单
  if (formData.value.province) {
    formData.value.detail_address = detailAddr;
    importText.value = '';
    // 设置 picker 索引
    const pIdx = regionData.findIndex(p => p.label === formData.value.province);
    const provinceData = regionData[pIdx];
    const cIdx = provinceData?.children?.findIndex(c => c.label === formData.value.city) ?? 0;
    const cityData = provinceData?.children?.[cIdx];
    let dIdx = 0;
    if (cityData?.children?.length > 0) {
      dIdx = cityData.children.findIndex(d => d.label === formData.value.district);
      if (dIdx < 0) dIdx = 0;
    }
    initRegionColumns(pIdx, cIdx, dIdx);
    uni.showToast({ title: '地址解析成功', icon: 'success' });
  }
}


async function loadAddressList() {
  loading.value = true;
  try {
    const res = await request.get('/address/list');
    addressList.value = res || [];
    // 设置选中默认地址
    const def = addressList.value.find(a => a.is_default);
    if (def) selectedId.value = def.id;
  } catch (e) {
    console.error('加载地址失败', e);
    if (e?.code === 401) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      uni.navigateTo({ url: '/pages/login/index' });
    }
  } finally {
    loading.value = false;
  }
}

function selectAddress(item) {
  selectedId.value = item.id;
  // 从确认订单页来，选择后返回
  const pages = getCurrentPages();
  const prevPage = pages[pages.length - 2];
  if (prevPage && prevPage.route.includes('order/confirm')) {
    uni.setStorageSync('selected_address', JSON.stringify(item));
    uni.navigateBack();
  }
}

function editAddress(item) {
  isEdit.value = true;
  formData.value = {
    id: item.id,
    name: item.name,
    phone: item.phone,
    province: item.province,
    city: item.city,
    district: item.district,
    detail_address: item.detail_address,
    is_default: !!Number(item.is_default)
  };
  // 定位省市区索引
  const pIdx = regionData.findIndex(p => p.label === item.province || p.value === item.province);
  const provinceIdx = pIdx >= 0 ? pIdx : 0;
  const province = regionData[provinceIdx];
  const hasDistrict = province?.children?.[0]?.children;
  const cIdx = province?.children?.findIndex(c => (c.label === item.city || c.value === item.city) && (hasDistrict ? c.children : true));
  const cityIdx = cIdx >= 0 ? cIdx : 0;
  const city = province?.children?.[cityIdx];
  let districtIdx = 0;
  if (hasDistrict && city?.children) {
    districtIdx = city.children.findIndex(d => d.label === item.district || d.value === item.district);
    if (districtIdx < 0) districtIdx = 0;
  }
  initRegionColumns(provinceIdx, cityIdx, districtIdx);
  showEditModal.value = true;
}

function initRegionColumns(provinceIdx = 0, cityIdx = 0, districtIdx = 0) {
  const p = regionData[provinceIdx];
  const cities = p?.children || [];
  regionCol1.value = regionData.map(pv => ({ label: pv.label, value: pv.value }));

  // 判断直辖市/无中间城市的省份（所有 children 都是叶子节点）
  const allLeaves = cities.length > 0 && cities.every(c => c.children.length === 0);

  if (allLeaves) {
    // 两级模式：直辖市等，省/市 -> 直接下属区县
    regionTwoLevel.value = true;
    regionCol2.value = cities.map(c => ({ label: c.label, value: c.value || c.label }));
    regionCol3.value = [];
    regionIndex.value = [provinceIdx, Math.min(cityIdx, cities.length - 1), 0];
  } else {
    // 三级模式：省-市-区
    regionTwoLevel.value = false;
    regionCol2.value = cities.map(c => ({ label: c.label, value: c.value || c.label }));
    const firstWithChildren = cities.find(c => c.children.length > 0);
    regionCol3.value = (firstWithChildren?.children || []).map(d => ({ label: d.label, value: d.value || d.label }));
    regionIndex.value = [provinceIdx, cityIdx, Math.min(districtIdx, regionCol3.value.length - 1)];
  }
}

function addAddress() {
  isEdit.value = false;
  formData.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail_address: '',
    is_default: addressList.value.length === 0
  };
  initRegionColumns();
  showEditModal.value = true;
}

function closeModal() {
  showEditModal.value = false;
}

function onRegionChange(e) {
  const [pIdx, cIdx, dIdx] = e.detail.value;
  formData.value.province = regionCol1.value[pIdx]?.label || '';
  if (regionTwoLevel.value) {
    // 两级模式（直辖市）：city = 省份名称，district = 选中的区县
    formData.value.city = regionCol1.value[pIdx]?.label || '';
    formData.value.district = regionCol2.value[cIdx]?.label || '';
  } else {
    formData.value.city = regionCol2.value[cIdx]?.label || '';
    formData.value.district = regionCol3.value[dIdx]?.label || '';
  }
}

function onRegionColumnChange(e) {
  const { column, value: colIdx } = e.detail;
  regionIndex.value[column] = colIdx;
  if (column === 0) {
    const province = regionData[colIdx];
    const cities = province?.children || [];
    const allLeaves = cities.length > 0 && cities.every(c => c.children.length === 0);
    regionTwoLevel.value = allLeaves;
    regionCol2.value = cities.map(c => ({ label: c.label, value: c.value || c.label }));
    if (allLeaves) {
      // 两级模式：直辖市
      regionCol3.value = [];
    } else {
      // 三级模式
      const firstWithChildren = cities.find(c => c.children.length > 0);
      regionCol3.value = (firstWithChildren?.children || []).map(d => ({ label: d.label, value: d.value || d.label }));
    }
    regionIndex.value = [colIdx, 0, 0];
  } else if (column === 1) {
    const province = regionData[regionIndex.value[0]];
    const cities = province?.children || [];
    const city = cities[colIdx];
    if (!regionTwoLevel.value) {
      // 三级模式才有第三列
      const hasDistrict = city?.children && city.children.length > 0;
      if (hasDistrict) {
        regionCol3.value = city.children.map(d => ({ label: d.label, value: d.value || d.label }));
      } else {
        regionCol3.value = [];
      }
    }
    regionIndex.value = [regionIndex.value[0], colIdx, 0];
  }
}

function onDefaultChange(e) {
  formData.value.is_default = e.detail.value;
}

async function submitAddress() {
  if (!formData.value.name?.trim()) {
    uni.showToast({ title: '请输入收货人', icon: 'none' });
    return;
  }
  if (!formData.value.phone || !/^1\d{10}$/.test(formData.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  if (!formData.value.province || !formData.value.detail_address?.trim()) {
    uni.showToast({ title: '请完善地址信息', icon: 'none' });
    return;
  }

  try {
    if (isEdit.value) {
      await request.put(`/address/${formData.value.id}`, formData.value);
      uni.showToast({ title: '更新成功', icon: 'success' });
    } else {
      await request.post('/address', formData.value);
      uni.showToast({ title: '添加成功', icon: 'success' });
    }
    closeModal();
    loadAddressList();
  } catch (e) {
    console.error('保存地址失败', e);
    uni.showToast({ title: '保存失败', icon: 'none' });
  }
}

async function setDefault(item) {
  try {
    await request.put(`/address/${item.id}/default`);
    uni.showToast({ title: '设置成功', icon: 'success' });
    loadAddressList();
  } catch (e) {
    console.error('设置默认失败', e);
  }
}

async function deleteAddress(item) {
  uni.showModal({
    title: '删除地址',
    content: '确定要删除该收货地址吗？',
    confirmColor: '#bb0004',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request.delete(`/address/${item.id}`);
          uni.showToast({ title: '删除成功', icon: 'success' });
          if (selectedId.value === item.id) selectedId.value = null;
          loadAddressList();
        } catch (e) {
          console.error('删除失败', e);
        }
      }
    }
  });
}
</script>

<style lang="scss">
/* ================================================================
   收货地址列表 - 完善功能 & 统一设计风格
   ================================================================ */

$primary: #bb0004;
$primary-container: #e1251b;
$on-primary: #ffffff;
$surface: #fbf9f9;
$surface-lowest: #ffffff;
$surface-low: #f5f3f3;
$surface-high: #e9e8e7;
$surface-highest: #e3e2e2;
$surface-container: #efeded;
$surface-container-low: #f5f3f3;
$surface-container-lowest: #ffffff;
$surface-container-high: #e9e8e7;
$surface-container-highest: #e3e2e2;
$on-surface: #1b1c1c;
$on-surface-variant: #5d3f3b;
$outline-variant: #e7bdb7;
$radius-sm: 8rpx;
$radius-md: 16rpx;
$radius-lg: 24rpx;
$radius-xl: 32rpx;
$radius-full: 9999rpx;
$tabbar-height: 100rpx;

.page {
  min-height: 100vh;
  background: $surface;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: env(safe-area-inset-top);
}

/* ── 顶部导航 ── */
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 128rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  padding-top: env(safe-area-inset-top);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24rpx;
}

.nav-left,
.nav-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 40rpx;
  color: $on-surface;
}

.nav-add {
  font-size: 40rpx;
  color: $primary;
}

.nav-title {
  font-family: 'Manrope', sans-serif;
  font-size: 34rpx;
  font-weight: 800;
  color: $on-surface;
  letter-spacing: -0.01em;
}

/* ── 地址列表 ── */
.address-list {
  padding: 148rpx 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.address-item {
  background: $surface-container-lowest;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;

  &.is-default {
    border: 2rpx solid rgba($primary, 0.2);
  }
}

.address-main {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx 24rpx;
  gap: 20rpx;
}

.address-left {
  flex: 1;
  min-width: 0;
}

.address-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
  gap: 12rpx;
}

.address-name {
  font-family: 'Manrope', sans-serif;
  font-size: 32rpx;
  font-weight: 800;
  color: $on-surface;
  letter-spacing: -0.01em;
}

.address-phone {
  font-size: 28rpx;
  color: $on-surface-variant;
  font-weight: 500;
}

.address-tag {
  background: rgba($primary, 0.1);
  color: $primary;
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 16rpx;
  border-radius: $radius-full;
  letter-spacing: 0.02em;
}

.address-detail {
  font-size: 26rpx;
  color: $on-surface-variant;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── 圆形选择框 ── */
.check-circle {
  width: 44rpx;
  height: 44rpx;
  border: 3rpx solid $outline-variant;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &.checked {
    background: $primary;
    border-color: $primary;
    box-shadow: 0 4rpx 12rpx rgba($primary, 0.3);
  }
}

.iconfont-check {
  font-size: 24rpx;
  color: $on-primary;
  font-weight: 700;
  line-height: 1;
}

/* ── 操作栏 ── */
.address-actions {
  display: flex;
  border-top: 1rpx solid $outline-variant;
  padding: 0 8rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  gap: 8rpx;
  font-size: 26rpx;
  color: $on-surface-variant;
  font-weight: 500;
  transition: color 0.15s;

  &:active {
    color: $primary;
  }

  &:not(:last-child) {
    border-right: 1rpx solid $outline-variant;
  }

  &.danger {
    color: #f56c6c;

    &:active {
      color: #e04040;
    }
  }
}

.action-icon {
  font-size: 32rpx;
}

/* ── 空状态 ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 280rpx;
}

.empty-icon-wrap {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: $surface-container-low;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  color: $on-surface-variant;
}

.empty-title {
  font-family: 'Manrope', sans-serif;
  font-size: 36rpx;
  font-weight: 800;
  color: $on-surface;
  margin-bottom: 16rpx;
}

.empty-sub {
  font-size: 26rpx;
  color: $on-surface-variant;
  margin-bottom: 56rpx;
}

.empty-btn {
  padding: 22rpx 64rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  border-radius: $radius-full;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 32rpx rgba($primary, 0.3);
}

/* ── Loading ── */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 300rpx;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid $surface-container-high;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── 底部占位 ── */
.bottom-placeholder {
  height: calc(200rpx + $tabbar-height);
}

/* ── 底部添加按钮 ── */
.add-btn-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc($tabbar-height + env(safe-area-inset-bottom));
  z-index: 50;
  padding: 0 32rpx;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 96rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  border-radius: $radius-full;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 32rpx rgba($primary, 0.3);

  .add-icon {
    font-size: 36rpx;
  }
}

/* ── 底部弹窗 ── */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
}

.modal-sheet {
  width: 100%;
  background: $surface-container-lowest;
  border-radius: $radius-xl $radius-xl 0 0;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sheet-handle {
  width: 80rpx;
  height: 8rpx;
  background: $surface-container-high;
  border-radius: $radius-full;
  margin: 16rpx auto 0;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 24rpx;
  border-bottom: 1rpx solid $outline-variant;
  flex-shrink: 0;
}

.sheet-title {
  font-family: 'Manrope', sans-serif;
  font-size: 34rpx;
  font-weight: 800;
  color: $on-surface;
  letter-spacing: -0.01em;
}

.sheet-close {
  font-size: 40rpx;
  color: $on-surface-variant;
}

.sheet-body {
  padding: 8rpx 32rpx 0;
  overflow-y: auto;
  flex: 1;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid $outline-variant;

  &:last-child {
    border-bottom: none;
  }

  &.form-switch {
    justify-content: space-between;
  }

  &.form-import {
    display: block;
    padding: 16rpx 0;
  }
}

.import-textarea {
  width: 100%;
  min-height: 120rpx;
  background: $surface-container-low;
  border-radius: $radius-md;
  padding: 24rpx;
  font-size: 28rpx;
  color: $on-surface;
  box-sizing: border-box;
  line-height: 1.6;
}

.btn-row {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.import-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 22rpx 0;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  border-radius: $radius-md;
  flex-shrink: 0;

  .material-symbols-outlined {
    font-size: 28rpx;
    color: $on-primary;
  }

  .btn-text {
    font-size: 26rpx;
    color: $on-primary;
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
  border-radius: $radius-md;
  font-size: 26rpx;
  color: $on-primary;
  font-weight: 600;

  .material-symbols-outlined {
    font-size: 28rpx;
    color: $on-primary;
  }
}


.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: $on-surface;
  font-weight: 500;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: $on-surface;
  font-weight: 500;
}

.ph-color {
  color: #ccc;
}

.picker-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: $on-surface;
  font-weight: 500;

  &.empty {
    color: #ccc;
  }

  .picker-arrow {
    font-size: 32rpx;
    color: $on-surface-variant;
  }
}

.switch-wrap {
  transform: scale(0.85);
}

.sheet-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  flex-shrink: 0;
  border-top: 1rpx solid $outline-variant;
}

.btn-cancel {
  flex: 1;
  height: 96rpx;
  background: $surface-container-high;
  color: $on-surface-variant;
  font-size: 30rpx;
  font-weight: 700;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm {
  flex: 2;
  height: 96rpx;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  font-size: 30rpx;
  font-weight: 700;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba($primary, 0.3);
}
</style>
