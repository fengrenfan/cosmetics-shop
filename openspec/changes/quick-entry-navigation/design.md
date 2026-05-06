## Context

首页 `index.vue` 的分类图标网格目前完全静态：

```javascript
// 现状：硬编码，从不请求后端
const categoryIcons = [
  { name: '每日特惠', icon: 'fa-tag', bgColor: '#FFE8E8', iconColor: '#E1251B' },
  // ... 10条固定数据
];
const quickEntries = ref([]);  // 声明了但从未赋值
```

后端数据结构：

```
QuickEntry {
  id: number
  title: string
  icon: string       // 图片 URL（含域名前缀）
  type: string       // none | product | category | url
  target_id: string  // 跳转目标（商品ID / 分类ID / 页面路径）
  sort_order: number
  status: number     // 1=启用
}
```

## Goals / Non-Goals

**Goals:**
- 首页加载时请求 `/quick-entry/list`，用返回数据渲染图标网格
- 按 `type` 实现正确跳转
- 无数据时隐藏整个网格区块

**Non-Goals:**
- 不做图标懒加载
- 不做本地缓存
- 不处理外链跳转

## Decisions

### 1. 数据加载

在 `loadHomeData()` 的 `Promise.all` 中并发请求 `GET /quick-entry/list`，结果赋给 `quickEntries`。失败时静默忽略（已有的 try/catch 覆盖）。

### 2. 图标渲染

后端 `icon` 字段是完整图片 URL（已含 `http://118.25.192.73` 前缀）。

```
旧方案（删除）：
  <text class="iconfont" :class="item.icon" :style="{ color: item.iconColor }">
  .grid-icon-bg { background: item.bgColor }

新方案：
  <image :src="item.icon" mode="aspectFill" />
  .grid-icon-bg { background: #F5F3F3 }  /* 统一浅灰兜底 */
```

图标区域尺寸保持 96×96rpx 不变，border-radius 保持 16rpx。

### 3. 跳转分发逻辑

```javascript
const TAB_PAGES = new Set([
  'pages/index/index',
  'pages/category/index',
  'pages/cart/index',
  'pages/mine/index',
]);

function onGridIconClick(item) {
  if (item.type === 'product') {
    uni.navigateTo({ url: `/pages/product/detail?id=${item.target_id}` });
  } else if (item.type === 'category') {
    uni.navigateTo({ url: `/pages/product/list?category_id=${item.target_id}` });
  } else if (item.type === 'url' && item.target_id) {
    const path = item.target_id.replace(/^\//, '');  // 去掉开头斜杠
    if (TAB_PAGES.has(path)) {
      uni.switchTab({ url: '/' + path });
    } else {
      uni.navigateTo({ url: '/' + path });
    }
  }
  // type=none: 不跳转
}
```

`TAB_PAGES` 判断是必须的——uni-app 规定 tabBar 页面只能用 `switchTab`，用 `navigateTo` 会报错。

### 4. 无数据兜底

```html
<view class="category-grid" v-if="quickEntries.length > 0">
```

无数据时整个区块不渲染，不降级回硬编码。

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 图片加载失败导致图标区域空白 | CSS 设置背景色兜底，视觉上不会完全空 |
| `target_id` 格式不规范（含/不含开头斜杠） | 代码中统一 `replace(/^\//, '')` 处理 |
| tabBar 页面用 navigateTo 报错 | `TAB_PAGES` 白名单判断，用 switchTab |
| 后端无数据导致首页网格消失 | v-if 隐藏，不影响其他区块，运营添加数据后自动出现 |
