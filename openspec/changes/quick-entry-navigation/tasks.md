## 1. 数据加载

- [x] 1.1 在 `loadHomeData()` 的 `Promise.all` 数组中增加 `request.get('/quick-entry/list')`，将结果赋给 `quickEntries`
- [x] 1.2 删除 `categoryIcons` 硬编码数组（const categoryIcons = [...]）

## 2. 模板渲染

- [x] 2.1 将 `category-grid` 的 `v-for` 数据源从 `categoryIcons` 改为 `quickEntries`，同时加 `v-if="quickEntries.length > 0"`
- [x] 2.2 将图标区域从 `<text class="iconfont" :class="item.icon">` 改为 `<image :src="item.icon" mode="aspectFill" />`，并设置 `width/height: 100%`
- [x] 2.3 移除 `.grid-icon-bg` 的动态 `:style="{ background: item.bgColor }"`，改为 CSS 静态背景色 `#F5F3F3`
- [x] 2.4 将标题绑定从 `item.name` 改为 `item.title`

## 3. 跳转逻辑

- [x] 3.1 在 `<script setup>` 中定义 `TAB_PAGES` 常量（Set，包含4个 tabBar 路径）
- [x] 3.2 重写 `onGridIconClick(item)` 函数，按 `item.type` 分发跳转：
  - `product` → `uni.navigateTo({ url: '/pages/product/detail?id=' + item.target_id })`
  - `category` → `uni.navigateTo({ url: '/pages/product/list?category_id=' + item.target_id })`
  - `url` → 判断 TAB_PAGES 选择 switchTab 或 navigateTo
  - `none` → 不跳转

## 4. 样式清理

- [x] 4.1 删除 `.grid-icon-bg` 中与动态颜色相关的 SCSS 变量引用（如 `$bgColor`）
- [x] 4.2 为 `.grid-icon-bg image` 添加样式：`width: 60rpx; height: 60rpx; border-radius: 8rpx;`
