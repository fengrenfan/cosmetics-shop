## Why

首页左上角有定位图标，但目前是静态显示"上海"，没有实际功能。用户无法选择或切换所在城市，降低了用户体验，也无法根据用户位置展示区域化的内容或库存。

## What Changes

1. **城市选择弹层** - 点击定位图标，弹出城市选择器（支持搜索热门城市列表）
2. **自动定位当前城市** - 通过 uni.getLocation 获取用户经纬度，逆地理编码获取城市名
3. **历史记录** - 记住用户上次选择的城市
4. **热门城市快捷选择** - 北京、上海、广州、深圳等热门城市置顶

## Capabilities

### New Capabilities
- `location-city-select`: 城市选择弹层，支持搜索和热门城市快捷选择
- `location-geolocation`: GPS自动定位，获取用户当前所在城市

### Modified Capabilities
- (none)

## Impact

- **Frontend**: 首页 `index.vue` 增加城市选择弹层、定位逻辑
- **Store**: 新增 `location.js` store 管理城市状态
- **Utils**: 新增 `location.js` 工具函数封装定位和城市匹配逻辑