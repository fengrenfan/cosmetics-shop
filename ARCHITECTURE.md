# 唯伊美妆 (Cosmetics Shop) — 项目架构与规范文档

> 自动生成于 2026-05-13，基于项目源码分析。

---

## 一、项目概览

| 属性 | 说明 |
|------|------|
| 项目名称 | 唯伊美妆 (Cosmetics Shop) |
| 项目类型 | 全栈 B2C 电商小程序系统 |
| 组成 | NestJS 后端 + Vue 3 管理后台 + uni-app 微信小程序 |
| 数据库 | MySQL 8.x |
| 认证方式 | JWT（有效期 7 天） |
| 支付模式 | Mock（开发环境），支持微信小程序 / H5 / 支付宝 H5 |

---

## 二、系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户端 (小程序/H5)                         │
│                   uni-app / Vue 3 / Pinia                       │
│           端口: 微信小程序 / H5 / App (各平台不同)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTP (Vite 代理 → /api)
┌───────────────────────────┼─────────────────────────────────────┐
│                     管理后台 (Admin)                              │
│              Vue 3 / Element Plus / Pinia / ECharts              │
│                      端口: 5174                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTP (Vite 代理 → /api)
┌───────────────────────────┴─────────────────────────────────────┐
│                     后端服务 (Server)                             │
│              NestJS 9 / TypeORM / Passport / JWT                │
│            全局前缀: /api  |  端口: 3001                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                       数据层                                      │
│              MySQL 8.x (118.25.192.73:3306)                     │
│              数据库名: cosmetics_shop                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、目录结构

```
cosmetics-shop/
├── AGENTS.md                   # LLM 编码行为准则
├── CLAUDE.md                   # Claude 编码行为准则 (同 AGENTS.md)
├── PROJECT_SPEC.md             # 项目开发规范文档 (详细版)
├── ARCHITECTURE.md             # 本文件 — 架构总览
│
├── server/                     # ===== NestJS 后端 =====
│   ├── src/
│   │   ├── main.ts             # 应用入口：CORS / 前缀 / 验证管道 / 静态资源
│   │   ├── app.module.ts       # 根模块：注册所有子模块 + 数据库 + JWT + 定时任务
│   │   ├── common/
│   │   │   └── interceptors/
│   │   │       └── response.interceptor.ts   # 统一响应格式 { code, message, data }
│   │   ├── config/
│   │   │   └── init.sql        # 数据库初始化脚本
│   │   └── modules/            # 18 个业务模块 (见下表)
│   ├── .env                    # 环境变量 (数据库 / JWT / 端口 / 支付模式)
│   ├── start-local.sh          # 一键启动脚本 (构建 + 连接远程 MySQL)
│   ├── tsconfig.json
│   └── package.json
│
├── admin/                      # ===== Vue 3 管理后台 =====
│   ├── src/
│   │   ├── main.js             # 入口：挂载 ElementPlus / Pinia / Router
│   │   ├── App.vue
│   │   ├── layout/index.vue    # 后台布局框架
│   │   ├── router/index.js     # 路由配置 (含路由守卫)
│   │   ├── utils/request.js    # Axios 封装 (Token / 错误处理 / 图片 URL 修正)
│   │   └── views/              # 页面视图
│   │       ├── dashboard/      # 数据看板
│   │       ├── login/          # 登录
│   │       ├── marketing/      # 营销管理 (banner / coupon / quick-entry / product-recommend / hot-products)
│   │       ├── order/          # 订单列表
│   │       ├── product/        # 商品管理 (list / category)
│   │       ├── system/         # 系统管理 (dict)
│   │       └── user/           # 用户列表
│   ├── dist/                   # 构建产物
│   ├── vite.config.js
│   └── package.json
│
├── miniapp/                    # ===== uni-app 小程序 =====
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── pages.json          # 页面路由 + tabBar 配置
│   │   ├── manifest.json       # uni-app 应用配置
│   │   ├── utils/
│   │   │   ├── request.js      # uni.request 封装 (Token / DeviceID / 响应标准化)
│   │   │   └── auth.js         # 登录/授权逻辑
│   │   ├── stores/             # Pinia 状态管理
│   │   │   ├── cart.js         # 购物车
│   │   │   ├── coupon.js       # 优惠券
│   │   │   ├── location.js     # 定位
│   │   │   └── user.js         # 用户
│   │   ├── components/         # 公共组件
│   │   │   ├── CartFooter.vue / CartItemCard.vue / CartTipBar.vue
│   │   │   ├── CitySelectModal.vue / QuantityStepper.vue
│   │   │   ├── RecommendItem.vue / RecommendSection.vue
│   │   │   ├── ShippingProgress.vue / SkuSelectModal.vue
│   │   │   └── ...
│   │   └── pages/              # 页面
│   │       ├── index/          # 首页
│   │       ├── category/       # 分类
│   │       ├── cart/           # 购物车
│   │       ├── mine/           # 我的
│   │       ├── product/        # 商品 (detail / list)
│   │       ├── order/          # 订单 (list / detail / confirm)
│   │       ├── address/        # 收货地址 (list / edit)
│   │       ├── favorite/       # 收藏
│   │       ├── coupon/         # 优惠券 (index / list / mine / select)
│   │       ├── login/          # 登录
│   │       ├── setting/        # 设置
│   │       ├── browse-history/ # 浏览历史
│   │       └── points/         # 积分明细
│   ├── vite.config.js
│   └── package.json
│
└── docs/                       # 设计文档
    └── superpowers/
        ├── plans/              # 实施计划
        └── specs/              # 设计规格
```

---

## 四、后端模块清单 (18 个)

| 模块 | 路径 | 职责 |
|------|------|------|
| `auth` | `modules/auth/` | JWT 认证、登录、微信登录、JWT Strategy |
| `user` | `modules/user/` | 用户 CRUD、角色管理 |
| `product` | `modules/product/` | 商品管理、SKU 管理 |
| `product-sku` | `modules/product/` | 商品规格实体 (与 product 同模块) |
| `category` | `modules/category/` | 商品分类树 |
| `cart` | `modules/cart/` | 购物车增删改查 |
| `order` | `modules/order/` | 订单创建 / 状态流转 / 定时关单 |
| `order-item` | `modules/order/` | 订单商品明细 (与 order 同模块) |
| `address` | `modules/address/` | 收货地址管理 |
| `coupon` | `modules/coupon/` | 优惠券发放 / 领取 / 核销 / 过期任务 |
| `banner` | `modules/banner/` | 首页轮播图管理 |
| `favorite` | `modules/favorite/` | 商品收藏 |
| `upload` | `modules/upload/` | 文件上传 (本地 / ali-oss) |
| `dashboard` | `modules/dashboard/` | 数据看板统计 |
| `dict` | `modules/dict/` | 数据字典 |
| `product-recommend` | `modules/product-recommend/` | 商品推荐位管理 |
| `quick-entry` | `modules/quick-entry/` | 首页快捷入口管理 |
| `browse-history` | `modules/browse-history/` | 浏览历史记录 |
| `points` | `modules/points/` | 积分获取 / 消耗 / FIFO 扣减 |
| `payment` | `modules/payment/` | 支付网关 (mock / real) / 支付回调 |

**每个模块的标准结构：**

```
module/
├── xxx.controller.ts    # 路由控制器 (RESTful API)
├── xxx.service.ts       # 业务逻辑层
├── xxx.entity.ts        # TypeORM 实体定义
├── xxx.dto.ts           # 请求参数校验 (class-validator)
├── xxx.module.ts        # NestJS 模块声明
└── xxx.task.ts          # 定时任务 (仅 order / coupon 有)
```

---

## 五、前端路由

### 5.1 Admin 管理后台路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/login` | Login | 登录页 |
| `/dashboard` | Dashboard | 数据看板 (默认首页) |
| `/product/list` | ProductList | 商品列表 |
| `/product/category` | Category | 分类管理 |
| `/order/list` | OrderList | 订单列表 |
| `/user/list` | UserList | 用户列表 |
| `/marketing/banner` | Banner | Banner 管理 |
| `/marketing/coupon` | Coupon | 优惠券管理 |
| `/marketing/quick-entry` | QuickEntry | 快捷入口管理 |
| `/marketing/product-recommend` | ProductRecommend | 商品推荐管理 |
| `/marketing/hot-products` | HotProducts | 热销商品管理 |
| `/system/dict` | Dict | 字典管理 |

**路由守卫：** 未登录 (无 `admin_token`) 时自动跳转 `/login`。

### 5.2 小程序页面路由

| 页面 | 说明 | TabBar |
|------|------|--------|
| `pages/index/index` | 首页 | ✅ 首页 |
| `pages/category/index` | 分类 | ✅ 分类 |
| `pages/cart/index` | 购物车 | ✅ 购物车 |
| `pages/mine/index` | 我的 | ✅ 我的 |
| `pages/product/detail` | 商品详情 | |
| `pages/product/list` | 商品列表 | |
| `pages/order/list` | 我的订单 | |
| `pages/order/detail` | 订单详情 | |
| `pages/order/confirm` | 确认订单 | |
| `pages/address/list` | 收货地址 | |
| `pages/address/edit` | 编辑地址 | |
| `pages/favorite/index` | 我的收藏 | |
| `pages/coupon/index` | 优惠券 | |
| `pages/coupon/list` | 领券中心 | |
| `pages/coupon/mine` | 我的优惠券 | |
| `pages/coupon/select` | 选择优惠券 | |
| `pages/login/index` | 登录 | |
| `pages/setting/index` | 设置 | |
| `pages/browse-history/index` | 浏览历史 | |
| `pages/points/logs` | 积分明细 | |

---

## 六、API 规范

### 6.1 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

- `code === 0` 表示成功，其他为失败
- 由 `ResponseInterceptor` 自动包装（控制器直接返回 data 即可）
- 如控制器已返回 `{ code, data }` 格式则跳过包装

### 6.2 认证

- Header: `Authorization: Bearer <token>`
- JWT 有效期: 7 天
- 小程序额外携带 `x-device-id` 头用于游客识别

### 6.3 API 前缀

所有接口统一使用 `/api` 前缀（由 `main.ts` 中 `setGlobalPrefix('api')` 设置）。

---

## 七、数据模型 (核心实体)

### 7.1 Product (商品)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 主键 |
| `category_id` | int | 分类 ID |
| `title` | varchar(200) | 商品标题 |
| `subtitle` | varchar(500) | 副标题 |
| `cover_image` | varchar(512) | 封面图 |
| `images` | text (JSON) | 商品图片列表 |
| `detail_html` | text | 商品详情 HTML |
| `price` | decimal(10,2) | 售价 |
| `original_price` | decimal(10,2) | 原价 |
| `stock` | int | 库存 |
| `sales_count` | int | 销量 |
| `view_count` | int | 浏览量 |
| `is_new` / `is_hot` / `is_recommend` / `is_seckill` | boolean | 营销标签 |
| `status` | int | 状态 |
| `skus` | OneToMany → ProductSku | SKU 规格 |

### 7.2 Order (订单)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int | 主键 |
| `order_no` | varchar(64) | 订单编号 |
| `user_id` | int | 用户 ID |
| `status` | varchar(20) | 订单状态 (pending → paid → shipped → completed / cancelled) |
| `total_amount` | decimal | 总金额 |
| `freight_amount` | decimal | 运费 |
| `pay_amount` | decimal | 实付金额 |
| `pay_status` | varchar(20) | 支付状态 (unpaid / paying / paid / failed / closed / refunding / refunded) |
| `pay_channel` | varchar(20) | 支付渠道 (wechat / alipay) |
| `pay_scene` | varchar(20) | 支付场景 (miniapp / h5) |
| `items` | OneToMany → OrderItem | 订单商品明细 |

---

## 八、业务规则

### 8.1 优惠券系统

| 类型 | 标识 | 规则 |
|------|------|------|
| 满减券 | `cash` | 满 X 减 Y |
| 折扣券 | `discount` | X% off，封顶减 Y |
| 无门槛券 | `noThreshold` | 无金额门槛 |

定时任务: 每日凌晨自动检查并过期优惠券。

### 8.2 积分系统

**获取规则：**
- 每笔订单固定返还: 10 积分
- 消费返还: 满 10 元返 1 积分

**使用规则：**
- 门槛: ≥ 500 积分方可使用
- 比例: 100 积分 = 1 元
- 倍数: 必须是 100 的整数倍
- 扣减策略: FIFO（优先扣减即将过期的积分批次）

### 8.3 支付系统

- 开发环境使用 `mock` 模式
- 支持渠道: 微信小程序 (`miniapp`) / 微信 H5 (`h5`) / 支付宝 H5
- 支付网关通过 `PAY_MODE` 环境变量切换 mock / real

### 8.4 图片资源

所有相对路径图片需拼接前缀 `http://118.25.192.73`，由 `request.fixImageUrl()` 统一处理。

---

## 九、技术栈详情

### 9.1 后端 (server/)

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | ^9.4.3 | Web 框架 |
| TypeScript | ^5.2.2 | 开发语言 |
| TypeORM | ^0.3.28 | ORM |
| MySQL | 8.x | 生产数据库 |

| Passport + JWT | ^0.6.0 / ^9.0.0 | 认证 |
| class-validator | ^0.14.0 | DTO 校验 |
| @nestjs/schedule | ^4.0.2 | 定时任务 |
| ali-oss | ^6.17.1 | 阿里云 OSS (文件上传) |
| multer | ^1.4.5 | 文件上传中间件 |
| bcryptjs | ^2.4.3 | 密码加密 |
| dayjs | ^1.11.10 | 日期处理 |

### 9.2 管理后台 (admin/)

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4.21 | 框架 |
| Vite | ^4.5.14 | 构建工具 |
| Element Plus | ^2.6.1 | UI 组件库 |
| Pinia | ^2.1.7 | 状态管理 |
| Vue Router | ^4.3.0 | 路由 |
| Axios | ^1.6.8 | HTTP 客户端 |
| ECharts | ^5.5.0 | 图表 |
| Sass | ^1.77.0 | 样式预处理 |

### 9.3 小程序 (miniapp/)

| 技术 | 版本 | 用途 |
|------|------|------|
| uni-app | 3.0.0-4010520240507001 | 跨平台框架 |
| Vue 3 | ^3.4.21 | 框架 |
| Pinia | ^2.1.7 | 状态管理 |
| @dcloudio/uni-ui | ^1.5.12 | UI 组件库 |
| Vite | ^5.2.8 | 构建工具 |
| Sass | ^1.77.0 | 样式预处理 |

---

## 十、开发环境

### 10.1 环境变量 (server/.env)

从模板创建并填写实际值：

```bash
cd server
cp .env.example .env
# 编辑 .env 填写数据库密码、JWT 密钥等
```

启动时会校验必需变量（`DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`、`JWT_SECRET`），缺失则报错退出。

> ⚠️ 不要将 `.env` 提交到 Git。

### 10.2 启动命令

```bash
# 后端 (端口 3001)
cd server && npm install && npm run dev

# 管理后台 (端口 5174)
cd admin && npm install && npm run dev

# 小程序 (微信开发者工具)
cd miniapp && npm install && npm run dev:mp-weixin

# 小程序 (H5 模式)
cd miniapp && npm run dev:h5
```

### 10.3 代理配置

- Admin: `/api` → `http://localhost:3001`
- Miniapp: `/api` → `http://127.0.0.1:3001`

### 10.4 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

---

## 十一、开发规范摘要

### 11.1 前端规范
- 使用 Vue 3 Composition API (`<script setup>`)
- 状态管理使用 Pinia (Option Store 风格)
- HTTP 请求通过统一封装的 `request.js`，不要直接使用 axios / uni.request

### 11.2 后端规范
- 每个模块遵循 `Controller → Service → Entity` 三层结构
- 请求参数使用 DTO + class-validator 校验
- 响应格式由全局 ResponseInterceptor 统一包装
- 静态资源（上传文件）通过 `/uploads` 路径访问

### 11.3 测试规范
- 测试框架: Jest + ts-jest
- 测试文件: `__tests__/*.spec.ts`
- 现有测试: `payment.service.spec.ts` / `coupon.controller.spec.ts` / `coupon.utils.spec.ts`

### 11.4 Git 分支
- Codex 分支前缀: `codex/`

---

## 十二、关键文件索引

| 用途 | 路径 |
|------|------|
| 后端入口 | `server/src/main.ts` |
| 根模块 | `server/src/app.module.ts` |
| 数据库初始化 | `server/src/config/init.sql` |
| 环境变量 | `server/.env` |
| 一键启动 | `server/start-local.sh` |
| Admin 路由 | `admin/src/router/index.js` |
| Admin 请求封装 | `admin/src/utils/request.js` |
| Admin 构建配置 | `admin/vite.config.js` |
| Miniapp 页面路由 | `miniapp/src/pages.json` |
| Miniapp 请求封装 | `miniapp/src/utils/request.js` |
| Miniapp 状态管理 | `miniapp/src/stores/` |
| Miniapp 构建配置 | `miniapp/vite.config.js` |
| 响应拦截器 | `server/src/common/interceptors/response.interceptor.ts` |

---

> 如需更详细的开发规范，请参阅 `PROJECT_SPEC.md`。
