## Why

首页快速入口区域（分类图标网格）当前使用硬编码的10个固定图标，点击全部跳转到分类Tab，无实际业务导航价值。后端 `quick-entry` 模块和 Admin 管理页面均已完整实现，但小程序首页从未接入，导致运营无法通过后台动态配置入口。

## What Changes

1. 首页 `loadHomeData()` 增加 `GET /quick-entry/list` 请求
2. 分类图标网格数据源从硬编码 `categoryIcons` 切换为后端动态数据 `quickEntries`
3. 图标渲染从 Font Awesome 类名改为图片 URL（`<image>` 标签）
4. `onGridIconClick` 实现真实跳转逻辑（按 type 分发）

## Capabilities

### Modified Capabilities
- `quick-entry-display`: 首页快速入口从静态硬编码改为后端动态加载与渲染
- `quick-entry-navigation`: 点击快速入口按 type 跳转至对应页面

### New Capabilities
- (none)

## Non-Goals

- 不修改后端 quick-entry 模块（接口已完备）
- 不修改 Admin 管理页面（已完整实现）
- 不新增 page 跳转类型（用 url 类型存页面路径即可覆盖所有场景）
- 不实现外链 webview 跳转（url 类型若为外链暂不处理）

## Impact

- **Frontend (miniapp)**: `pages/index/index.vue` 单文件修改
- **Backend**: 无需改动
- **Admin**: 无需改动
