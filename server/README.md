# 唯伊美妆 - 后端 API 服务

基于 NestJS + TypeScript + MySQL 的电商后端服务

## 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript
- **数据库**: MySQL 8.x + TypeORM
- **认证**: JWT + Passport
- **验证**: class-validator + class-transformer

## 项目结构

```
src/
├── main.ts                      # 应用入口
├── app.module.ts               # 根模块
├── common/                      # 公共模块
│   ├── guards/                 # 守卫
│   ├── interceptors/            # 拦截器
│   ├── filters/               # 异常过滤器
│   └── dto/                    # 公共 DTO
├── config/                      # 配置文件
│   └── database.config.ts      # 数据库 SQL 脚本
└── modules/                     # 功能模块
    ├── auth/                   # 认证模块
    ├── user/                   # 用户模块
    ├── product/                # 商品模块
    ├── category/               # 分类模块
    ├── cart/                   # 购物车模块
    ├── order/                  # 订单模块
    ├── address/                # 收货地址模块
    ├── coupon/                 # 优惠券模块
    ├── banner/                 # 轮播图模块
    ├── favorite/              # 收藏模块
    ├── upload/                # 文件上传模块
    └── dashboard/             # 数据看板模块
```

## API 接口列表

### 认证模块 `/api/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /wx-login | 微信小程序登录 |
| POST | /admin-login | 管理员登录 |
| POST | /refresh | 刷新 Token |
| GET | /profile | 获取用户信息 |

### 分类模块 `/api/category`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /tree | 获取分类树 |

### 商品模块 `/api/product`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /list | 商品列表 |
| GET | /recommend | 推荐商品 |
| GET | /featured | 主推商品 |
| GET | /hot | 热卖商品 |
| GET | /:id | 商品详情 |

### 购物车模块 `/api/cart`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /list | 购物车列表 |
| POST | /add | 加入购物车 |
| PUT | /:id | 更新数量 |
| DELETE | /:id | 删除商品 |
| DELETE | /batch | 批量删除 |
| PUT | /checked | 更新选中状态 |

### 订单模块 `/api/order`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /create | 创建订单 |
| GET | /list | 订单列表 |
| GET | /:id | 订单详情 |
| PUT | /:id/cancel | 取消订单 |
| PUT | /:id/confirm | 确认收货 |
| GET | /count | 订单数量统计 |

### 收货地址模块 `/api/address`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /list | 地址列表 |
| POST | / | 新增地址 |
| PUT | /:id | 更新地址 |
| DELETE | /:id | 删除地址 |
| PUT | /:id/default | 设为默认 |

### 优惠券模块 `/api/coupon`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /available | 可领取优惠券 |
| POST | /claim/:id | 领取优惠券 |
| GET | /my | 我的优惠券 |

### Banner 模块 `/api/banner`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /list | Banner 列表 |

### 收藏模块 `/api/favorite`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /list | 收藏列表 |
| POST | /toggle | 收藏/取消收藏 |

### 数据看板 `/api/dashboard`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /stats | 统计数据 |

## 环境变量

创建 `.env` 文件：

```env
# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cosmetics_shop

# JWT
JWT_SECRET=your-secret-key

# 微信登录
WX_APPID=your_appid
WX_SECRET=your_secret
```

## 启动

```bash
# 安装依赖
npm install

# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## 数据库初始化

1. 创建数据库：
```sql
CREATE DATABASE cosmetics_shop DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 执行 SQL 脚本：
```bash
# 方法1: 手动执行
mysql -u root -p cosmetics_shop < src/config/database.config.ts

# 方法2: TypeORM 自动同步 (开发环境)
# app.module.ts 中设置 synchronize: true
```

## 订单状态流转

```
pending (待付款) → paid (已付款) → shipped (已发货) → completed (已完成)
       ↓                                  ↓
   cancelled (已取消)              refunded (已退款)
```

## 优惠券类型

- `fixed`: 满减券 (满 X 减 Y)
- `percent`: 折扣券 (X% off，最高减 Y)
