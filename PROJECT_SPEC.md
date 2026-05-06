# 唯伊美妆电商项目 - 开发规范文档

> 本文档为项目开发规范，供后续开发参考使用。

---

## 一、项目概述

**项目名称**: 唯伊美妆 (Cosmetics Shop)
**项目类型**: 全栈B2C电商小程序系统
**组成**: NestJS后端 + Vue3管理后台 + uni-app小程序

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      小程序用户端                        │
│                   (uni-app / Vue3)                      │
│              端口: 根据平台不同而不同                     │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                      管理后台                            │
│                   (Vue3 / Element Plus)                 │
│                    端口: 5178                           │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                      后端服务                              │
│               (NestJS / TypeORM / MySQL)                 │
│                    端口: 3001                             │
└─────────────────────────────────────────────────────────┘
```

---

## 二、技术栈

### 2.1 后端 (server/)

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | ^9.4.3 | Web框架 |
| TypeScript | ^5.2.2 | 开发语言 |
| TypeORM | ^0.3.28 | ORM数据库访问 |
| MySQL | 8.x | 主数据库 |
| SQLite | ^6.0.1 | 开发环境数据库 |
| JWT | ^9.0.0 | 身份认证 |
| Passport | ^0.6.0 | 认证策略 |
| class-validator | ^0.14.0 | DTO验证 |
| dayjs | ^1.11.10 | 日期处理 |

### 2.2 管理后台 (admin/)

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4.21 | 框架 |
| Vite | ^4.5.14 | 构建工具 |
| Element Plus | ^2.6.1 | UI组件库 |
| Pinia | ^2.1.7 | 状态管理 |
| Vue Router | ^4.3.0 | 路由 |
| Axios | ^1.6.8 | HTTP客户端 |
| ECharts | ^5.5.0 | 图表 |
| Sass | ^1.77.0 | 样式预处理器 |

### 2.3 小程序 (miniapp/)

| 技术 | 版本 | 用途 |
|------|------|------|
| uni-app | 3.0.0-4010520240507001 | 跨平台框架 |
| Vue 3 | ^3.4.21 | 框架 |
| Pinia | ^2.1.7 | 状态管理 |
| Vite | ^5.2.8 | 构建工具 |

---

## 三、目录结构

```
cosmetics-shop/
├── server/                     # NestJS 后端服务 (端口3001)
│   ├── src/
│   │   ├── main.ts            # 应用入口
│   │   ├── app.module.ts      # 根模块
│   │   ├── common/            # 公共模块
│   │   │   └── interceptors/  # 响应拦截器
│   │   ├── config/            # 配置文件
│   │   │   └── init.sql       # 数据库初始化脚本
│   │   └── modules/           # 功能模块
│   │       ├── auth/          # 认证模块
│   │       ├── user/          # 用户模块
│   │       ├── product/       # 商品模块
│   │       ├── category/      # 分类模块
│   │       ├── cart/          # 购物车模块
│   │       ├── order/         # 订单模块
│   │       ├── address/       # 收货地址模块
│   │       ├── coupon/        # 优惠券模块
│   │       ├── banner/        # 轮播图模块
│   │       ├── favorite/      # 收藏模块
│   │       ├── upload/        # 文件上传模块
│   │       ├── dashboard/     # 数据看板模块
│   │       ├── dict/          # 字典模块
│   │       ├── product-recommend/ # 商品推荐模块
│   │       ├── quick-entry/   # 快捷入口模块
│   │       ├── browse-history/ # 浏览历史模块
│   │       ├── points/        # 积分模块
│   │       └── payment/       # 支付模块
│   ├── .env                   # 环境变量
│   ├── tsconfig.json          # TypeScript配置
│   └── package.json
│
├── admin/                      # Vue3 管理后台 (端口5178)
│   ├── src/
│   │   ├── main.js            # 入口文件
│   │   ├── App.vue            # 根组件
│   │   ├── router/            # 路由配置
│   │   ├── views/             # 页面视图
│   │   │   ├── login/         # 登录页
│   │   │   ├── dashboard/      # 首页
│   │   │   ├── product/       # 商品管理
│   │   │   ├── order/         # 订单管理
│   │   │   ├── user/          # 用户管理
│   │   │   ├── marketing/     # 营销管理
│   │   │   └── system/        # 系统管理
│   │   ├── layout/            # 布局组件
│   │   └── utils/              # 工具函数
│   ├── vite.config.js
│   └── package.json
│
├── miniapp/                    # Uni-app 小程序
│   ├── src/
│   │   ├── main.js            # 入口文件
│   │   ├── App.vue            # 根组件
│   │   ├── pages.json         # 页面配置
│   │   ├── manifest.json      # 应用配置
│   │   ├── pages/             # 页面
│   │   │   ├── index/         # 首页
│   │   │   ├── category/      # 分类页
│   │   │   ├── cart/          # 购物车页
│   │   │   ├── mine/          # 我的页
│   │   │   ├── product/        # 商品页
│   │   │   ├── order/         # 订单页
│   │   │   ├── address/       # 地址页
│   │   │   ├── coupon/        # 优惠券页
│   │   │   ├── favorite/       # 收藏页
│   │   │   ├── browse-history/ # 浏览历史页
│   │   │   ├── points/        # 积分页
│   │   │   ├── login/         # 登录页
│   │   │   └── setting/       # 设置页
│   │   ├── components/        # 组件
│   │   ├── stores/            # Pinia状态管理
│   │   │   ├── user.js
│   │   │   ├── cart.js
│   │   │   └── coupon.js
│   │   └── utils/             # 工具函数
│   ├── vite.config.js
│   └── package.json
│
├── mock-server/               # Express Mock服务器 (端口3000)
│   ├── server.js
│   └── package.json
│
├── docs/                      # 文档
│   └── superpowers/          # 规划文档
│       ├── specs/            # 设计文档
│       └── plans/            # 实现计划
│
├── CLAUDE.md                  # AI行为指南
└── .gitignore
```

---

## 四、后端架构规范

### 4.1 模块结构规范

每个功能模块必须包含以下文件：

```
module/
├── module.entity.ts       # 数据实体 (对应数据库表)
├── module.dto.ts          # 数据传输对象 (请求/响应验证)
├── module.service.ts      # 业务逻辑层
├── module.controller.ts   # API控制器 (路由定义)
├── module.module.ts       # NestJS模块注册
├── module.constants.ts    # 常量定义
├── module.utils.ts        # 工具函数
└── __tests__/             # 单元测试
```

### 4.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | PascalCase | `CouponService`, `OrderController` |
| 文件名 | kebab-case | `coupon.service.ts`, `order.controller.ts` |
| 数据库表 | snake_case | `user_coupon`, `order_item` |
| 数据库列 | snake_case | `created_at`, `user_id` |
| 接口路径 | kebab-case | `/api/order/create` |

### 4.3 装饰器使用规范

```typescript
// 服务类
@Injectable()

// 数据实体
@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_no' })
  orderNo: string;
}

// 控制器
@Controller('order')
@UseGuards(JwtAuthGuard)

// DTO验证
export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}
```

### 4.4 API响应格式

```typescript
// 成功响应
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// 错误响应
{
  "code": 400,
  "message": "参数错误",
  "data": null
}
```

---

## 五、数据库规范

### 5.1 核心数据表

| 表名 | 说明 |
|------|------|
| user | 用户表 |
| product | 商品表 |
| product_sku | SKU规格表 |
| category | 商品分类表 |
| cart | 购物车表 |
| order | 订单表 |
| order_item | 订单商品表 |
| address | 收货地址表 |
| coupon | 优惠券表 |
| user_coupon | 用户优惠券表 |
| favorite | 收藏表 |
| banner | 轮播图表 |
| upload | 上传记录表 |
| point_log | 积分记录表 |
| payment_record | 支付记录表 |

### 5.2 数据库初始化

```bash
mysql -u root -p cosmetics_shop < server/src/config/init.sql
```

---

## 六、API接口规范

### 6.1 认证模块 `/api/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /wx-login | 微信小程序登录 |
| POST | /admin-login | 管理员登录 |
| POST | /phone-login | 手机验证码登录 |
| POST | /send-code | 发送验证码 |
| POST | /refresh | 刷新Token |
| GET | /profile | 获取用户信息 |

### 6.2 商品模块 `/api/product`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /list | 商品列表 |
| GET | /recommend | 推荐商品 |
| GET | /featured | 主推商品 |
| GET | /hot | 热卖商品 |
| GET | /:id | 商品详情 |

### 6.3 订单模块 `/api/order`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /create | 创建订单 |
| GET | /list | 订单列表 |
| GET | /:id | 订单详情 |
| PUT | /:id/cancel | 取消订单 |
| PUT | /:id/confirm | 确认收货 |
| GET | /count | 订单统计 |
| PUT | /admin/:id/ship | 管理端发货 |
| PUT | /admin/:id/refund | 管理端退款 |

### 6.4 订单状态流转

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌───────────┐
│ pending │────▶│   paid  │────▶│ shipped │────▶│ completed │
│ 待付款  │     │ 已付款  │     │ 已发货  │     │  已完成   │
└────┬────┘     └─────────┘     └─────────┘     └───────────┘
     │                │                                    │
     ▼                ▼                                    ▼
┌───────────┐   ┌───────────┐                        ┌──────────┐
│ cancelled │   │ refunded  │                        │ refunded │
│  已取消   │   │  已退款   │                        │  已退款  │
└───────────┘   └───────────┘                        └──────────┘
```

---

## 七、环境配置

### 7.1 后端环境变量 (server/.env)

```env
# 数据库配置
DB_HOST=118.25.192.73
DB_PORT=3306
DB_USER=cosmetics
DB_PASSWORD=cosmetics123
DB_NAME=cosmetics_shop

# JWT配置
JWT_SECRET=cosmetics-shop-secret-2024

# 服务配置
PORT=3001

# 支付模式
PAY_MODE=mock
```

### 7.2 开发代理配置

**Admin (vite.config.js)**:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true
  }
}
```

**Miniapp (vite.config.js)**:
```javascript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true
  }
}
```

---

## 八、业务规则

### 8.1 优惠券系统

**三种类型**:

| 类型 | 标识 | 说明 |
|------|------|------|
| 满减券 | `cash` | 满X减Y |
| 折扣券 | `discount` | X% off，最高减Y |
| 无门槛券 | `noThreshold` | 无金额门槛 |

**定时任务**: 每日凌晨检查过期优惠券

### 8.2 积分系统

**积分返还规则**:
- 每笔订单固定返还: 10积分
- 消费返还: 满10元返1积分

**积分抵扣规则**:
- 使用门槛: 满500积分才可使用
- 抵扣比例: 100积分 = 1元
- 使用倍数: 必须是100的倍数

**积分扣减策略**: FIFO (优先扣减即将过期的积分批次)

### 8.3 支付系统

- 支付模式: `mock` (开发环境)
- 支持渠道: 微信小程序、微信H5、支付宝H5

---

## 九、认证机制

### 9.1 JWT配置

- 有效期: 7天
- Header: `Authorization: Bearer <token>`

### 9.2 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

### 9.3 微信登录

通过微信授权code换取openid完成登录

---

## 十、前端开发规范

### 10.1 Vue 3 组合式API

```javascript
<script setup>
import { ref, reactive, onMounted } from 'vue';

const count = ref(0);
const form = reactive({ name: '' });

onMounted(() => {
  // 初始化逻辑
});
</script>
```

### 10.2 Pinia Store 规范

```javascript
// stores/cart.js
export const useCartStore = defineStore('cart', {
  state: () => ({
    list: [],
    badge: 0
  }),

  getters: {
    totalPrice: (state) => state.list.reduce((sum, item) => sum + item.price, 0)
  },

  actions: {
    addItem(product) {
      this.list.push(product);
      this.badge = this.list.length;
    }
  }
});
```

### 10.3 请求封装 (miniapp/src/utils/request.js)

- 统一处理Token
- 统一处理图片URL前缀
- 统一处理响应格式

---

## 十一、启动命令

### 11.1 后端服务

```bash
cd server
npm install
npm run dev        # 开发模式 (端口3001)
npm run build      # 构建
npm run start:prod # 生产模式
```

### 11.2 管理后台

```bash
cd admin
npm install
npm run dev        # 开发模式 (端口5178)
npm run build      # 构建
```

### 11.3 小程序

```bash
cd miniapp
npm install
npm run dev:mp-weixin  # 微信小程序
npm run dev:h5         # H5
npm run dev:app        # App
```

### 11.4 Mock服务器

```bash
cd mock-server
npm install
npm run dev  # 端口3000
```

---

## 十二、测试规范

### 12.1 后端测试

- 测试框架: Jest + ts-jest
- 测试文件位置: `__tests__/` 目录
- 命名规范: `*.spec.ts`

```typescript
describe('coupon.utils', () => {
  describe('calculateDiscount', () => {
    it('should calculate discount correctly for cash coupon', () => {
      const coupon = createCoupon({ type: COUPON_TYPE.CASH, value: 20 });
      const result = calculateDiscount(coupon, 100);
      expect(result.discountAmount).toBe(20);
    });
  });
});
```

### 12.2 现有测试文件

| 文件 | 说明 |
|------|------|
| payment.service.spec.ts | 支付服务测试 |
| coupon.controller.spec.ts | 优惠券控制器测试 |
| coupon.utils.spec.ts | 优惠券工具函数测试 |

---

## 十三、关键文件索引

| 用途 | 文件路径 |
|------|----------|
| 数据库初始化SQL | `server/src/config/init.sql` |
| 后端环境配置 | `server/.env` |
| 后端入口文件 | `server/src/main.ts` |
| Admin路由配置 | `admin/src/router/index.js` |
| Miniapp页面配置 | `miniapp/src/pages.json` |
| Miniapp状态管理 | `miniapp/src/stores/` |
| Miniapp请求封装 | `miniapp/src/utils/request.js` |
| Miniapp登录逻辑 | `miniapp/src/utils/auth.js` |
| Admin请求封装 | `admin/src/utils/request.js` |
| Vite配置(Admin) | `admin/vite.config.js` |
| Vite配置(Miniapp) | `miniapp/vite.config.js` |

---

## 十四、注意事项

1. **图片服务器**: 所有图片URL需拼接前缀 `http://118.25.192.73`
2. **开发环境数据库**: 使用SQLite，生产环境使用MySQL
3. **API前缀**: 所有接口统一使用 `/api` 前缀
4. **微信开发**: 需要在微信公众平台配置合法域名

---

## 十五、文档更新记录

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-04-30 | 1.0.0 | 初始版本，建立项目开发规范 |

---

> 本文档由 AI 辅助生成，如有疑问请联系开发团队。
