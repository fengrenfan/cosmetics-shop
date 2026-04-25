# 优惠券系统设计方案

**版本**: v1.0
**日期**: 2026-04-24
**状态**: 待用户评审

---

## 1. 概述

### 1.1 背景
现有优惠券功能较简单，仅支持基础的领取和查看。本设计旨在完善优惠券系统，实现满减券、折扣券、无门槛券的完整业务流程。

### 1.2 设计原则
- **简洁分层**: CouponService 管"发"，OrderService 管"用"
- **职责分离**: 优惠券服务负责发放/领取/管理，订单服务负责核销时独立验证
- **符合现有风格**: 保持与项目现有代码风格一致

---

## 2. 架构设计

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                      小程序端                            │
│  领券页 ──→ 我的优惠券 ──→ 结算页选择优惠券 ──→ 下单成功   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   CouponModule（优惠券模块）              │
│                                                         │
│  CouponService（券管理）                                 │
│  - create/update/delete: CRUD 管理                       │
│  - grantToUser: 管理员发放                               │
│  - autoGrant: 条件触发自动发放                           │
│  - getAvailable: 可领取列表                             │
│  - claim: 用户领取                                      │
│  - getMyCoupons: 我的优惠券                             │
│  - validateForOrder: 核销前验证（被 OrderService 调用）   │
│  - applyToOrder: 计算优惠金额（被 OrderService 调用）     │
│                                                         │
│  CouponEntity（券模板）                                  │
│  UserCouponEntity（用户持有券）                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   OrderModule（订单模块）                 │
│                                                         │
│  OrderService                                          │
│  - 创建订单时调用 CouponService.validateForOrder        │
│  - 计算优惠时调用 CouponService.applyToOrder             │
│  - 下单成功后调用 CouponService.markAsUsed               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心接口

#### CouponService 对外接口

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| getAvailable | userId | Coupon[] | 获取可领取的优惠券（含用户领取状态） |
| claim | couponId, userId | void | 用户领取优惠券 |
| getMyCoupons | userId, status? | UserCoupon[] | 获取我的优惠券 |
| validateForOrder | userId, couponId, orderAmount | ValidationResult | 核销前验证 |
| applyToOrder | couponId, orderAmount | DiscountResult | 计算优惠金额 |
| markAsUsed | userCouponId, orderId | void | 标记为已使用 |
| create | dto | Coupon | 管理员创建优惠券 |
| update | id, dto | Coupon | 管理员更新优惠券 |
| delete | id | void | 管理员删除优惠券 |
| grantToUser | userId, couponId | UserCoupon | 管理员发放优惠券 |
| autoGrant | userId, trigger | UserCoupon[] | 自动发放优惠券 |

---

## 3. 数据模型

### 3.1 Coupon（优惠券模板）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| title | varchar(100) | 优惠券名称 |
| type | varchar(20) | 类型: `cash`满减, `discount`折扣, `noThreshold`无门槛 |
| value | decimal(10,2) | 优惠值（满减金额或折扣率） |
| min_amount | decimal(10,2) | 最低消费门槛（无门槛填0） |
| max_discount | decimal(10,2) | 最高折扣金额（折扣券上限） |
| total_count | int | 总发行量 |
| used_count | int | 已使用数量 |
| per_limit | int | 每人限领数量 |
| start_time | datetime | 开始时间 |
| end_time | datetime | 结束时间 |
| status | int | 状态: 1启用 0禁用 |
| auto_grant | tinyint | 是否支持自动发放: 0否 1新用户注册 2首单 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 3.2 UserCoupon（用户持有券）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| user_id | int | 用户ID |
| coupon_id | int | 优惠券模板ID |
| status | varchar(20) | 状态: `unused`待使用, `used`已使用, `expired`已过期 |
| claimed_at | datetime | 领取时间 |
| used_at | datetime | 使用时间 |
| order_id | int | 使用的订单ID |
| source | varchar(20) | 来源: `claim`领取, `admin`管理员发放, `auto`自动发放 |

### 3.3 索引设计

```sql
-- Coupon 表
CREATE INDEX idx_coupon_status_time ON coupon(status, start_time, end_time);

-- UserCoupon 表
CREATE INDEX idx_user_coupon_user_status ON user_coupon(user_id, status);
CREATE INDEX idx_user_coupon_coupon ON user_coupon(coupon_id);
```

---

## 4. 业务规则

### 4.1 优惠券类型规则

| 类型 | type 值 | value 含义 | max_discount | min_amount |
|------|---------|------------|--------------|-------------|
| 满减券 | `cash` | 减免金额（元） | 可设上限 | 必须 > 0 |
| 折扣券 | `discount` | 折扣率（如 0.8 表示 8 折） | 最高减免金额 | 可为 0 |
| 无门槛券 | `noThreshold` | 减免金额（元） | 可设上限 | 必须 = 0 |

### 4.2 领取规则

1. 当前时间必须在优惠券的 `start_time` 和 `end_time` 范围内
2. 优惠券状态必须为启用（status=1）
3. `used_count < total_count`（有库存）
4. 用户已领取数量 < `per_limit`
5. 用户未领取过该券（或已领取但已使用/过期可再领，取决于业务策略）

### 4.3 核销验证规则（OrderService 调用）

调用 `CouponService.validateForOrder(userId, couponId, orderAmount)`，返回验证结果：

```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: 'NO_STOCK' | 'EXPIRED' | 'NOT_CLAIMED' | 'BELOW_MIN_AMOUNT' | 'ALREADY_USED' | 'CLAIM_EXCEEDED';
}
```

验证项：
- [ ] 库存验证: `used_count < total_count`
- [ ] 有效期验证: `now >= start_time && now <= end_time`
- [ ] 门槛验证: `orderAmount >= min_amount`
- [ ] 用户领取验证: 用户已领取该券
- [ ] 使用次数验证: 用户使用该券次数 < per_limit

### 4.4 优惠金额计算

调用 `CouponService.applyToOrder(couponId, orderAmount)`：

```typescript
interface DiscountResult {
  discountAmount: number;  // 优惠金额
  finalAmount: number;    // 最终金额
}
```

计算规则：
- **满减券**: `discountAmount = min(value, max_discount || Infinity)`
- **折扣券**: `discountAmount = orderAmount * (1 - value)`，上限 `max_discount`
- **无门槛券**: `discountAmount = min(value, max_discount || Infinity)`

---

## 5. API 设计

### 5.1 用户端 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/coupon/available | 可领取优惠券列表 |
| POST | /api/coupon/claim/:id | 领取优惠券 |
| GET | /api/coupon/my | 我的优惠券列表 |
| POST | /api/coupon/validate | 验证优惠券是否可用（结算页调用） |
| POST | /api/coupon/apply | 计算优惠金额（结算页调用） |

### 5.2 管理端 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/coupon/admin/list | 优惠券列表 |
| POST | /api/coupon/admin | 创建优惠券 |
| PUT | /api/coupon/admin/:id | 更新优惠券 |
| DELETE | /api/coupon/admin/:id | 删除优惠券 |
| POST | /api/coupon/admin/grant | 发放优惠券给用户 |

### 5.3 模块内部调用（OrderService 调用）

| 调用方式 | 说明 |
|----------|------|
| `CouponService.validateForOrder(userId, couponId, orderAmount)` | 核销前验证 |
| `CouponService.applyToOrder(couponId, orderAmount)` | 计算优惠金额 |
| `CouponService.markAsUsed(userCouponId, orderId)` | 标记已使用 |

---

## 6. 前端页面设计

### 6.1 页面清单

| 页面 | 路径 | 说明 |
|------|------|------|
| 领券中心 | /pages/coupon/list | 可领取的优惠券列表 |
| 我的优惠券 | /pages/coupon/mine | 用户持有的优惠券（含状态筛选） |
| 优惠券选择 | /pages/coupon/select | 结算页选择可用优惠券 |

### 6.2 领券中心页
- 展示可领取的优惠券卡片
- 显示：券名、优惠内容、有效期、领取按钮/已领取标识
- 点击领取按钮调 `POST /api/coupon/claim/:id`

### 6.3 我的优惠券页
- Tab 切换：全部 / 待使用 / 已使用 / 已过期
- 展示用户持有的优惠券
- 待使用券支持后续扩展“立即使用”入口（一期以列表展示为主）

### 6.4 优惠券选择页
- 结算页调起
- 展示当前订单可用的优惠券
- 不可用券灰显并显示原因
- 选中后返回结算页更新价格

---

## 7. 状态流转

### 7.1 UserCoupon 状态流转

```
[创建] ──→ unused ──→ [下单] ──→ used
              │
              └──→ [过期] ──→ expired
```

### 7.2 状态变更时机

| 当前状态 | 事件 | 下一状态 | 触发 |
|----------|------|----------|------|
| - | 领取成功 | unused | claim() |
| unused | 订单使用 | used | markAsUsed() |
| unused | 超过 end_time | expired | 定时任务或查询时判断 |

---

## 8. 定时任务

### 8.1 实现方式

使用 NestJS 内置 `@nestjs/schedule` 模块，通过 `@Cron` 装饰器实现定时任务。

```typescript
// coupon.module.ts
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),  // 当前实现注册在 CouponModule
    // ... 其他模块
  ],
})
export class CouponModule {}
```

### 8.2 任务清单

| 任务名称 | cron 表达式 | 说明 |
|----------|-------------|------|
| expireUserCoupons | `0 0 * * *` | 每天 00:00 执行，批量更新过期券状态 |
| syncCouponStock | `0 */30 * * * *` | 每 30 分钟同步一次库存（可选） |

### 8.3 优惠券过期处理任务

**任务**: `expireUserCoupons`
**执行时间**: 每天 00:00
**逻辑**:

```typescript
@Cron('0 0 * * *')  // 每天凌晨 0 点
async handleCouponExpiration() {
  const now = new Date();

  // 查询所有已过期但状态仍为 unused 的用户券
  const expiredUserCoupons = await this.userCouponRepository
    .createQueryBuilder('uc')
    .leftJoinAndSelect('uc.coupon', 'coupon')
    .where('uc.status = :status', { status: 'unused' })
    .andWhere('coupon.end_time < :now', { now })
    .getMany();

  if (expiredUserCoupons.length === 0) {
    return;
  }

  // 批量更新状态
  const ids = expiredUserCoupons.map(uc => uc.id);
  await this.userCouponRepository
    .createQueryBuilder()
    .update(UserCoupon)
    .set({ status: 'expired' })
    .whereInIds(ids)
    .execute();

  this.logger.log(`[Coupon Expiration] Updated ${ids.length} user coupons to expired`);
}
```

**错误处理**:
- 单次失败不影响其他券状态
- 异常时记录日志并抛出，不重试（次日会再次执行）
- 日志格式: `[Coupon Expiration] Success: N expired | Failed: error message`

### 8.4 库存同步任务（可选）

**任务**: `syncCouponStock`
**执行时间**: 每 30 分钟
**逻辑**: 定期校验 `used_count` 与 `user_coupon` 表中 `status='used'` 的实际数量是否一致，修复数据差异。

```typescript
@Cron('0 */30 * * * *')  // 每 30 分钟
async syncCouponStock() {
  const coupons = await this.couponRepository.find();

  for (const coupon of coupons) {
    const actualUsedCount = await this.userCouponRepository.count({
      where: { coupon_id: coupon.id, status: 'used' },
    });

    if (coupon.used_count !== actualUsedCount) {
      await this.couponRepository.update(coupon.id, {
        used_count: actualUsedCount,
      });
      this.logger.warn(
        `[Coupon Stock Sync] Coupon #${coupon.id} used_count corrected: ${coupon.used_count} -> ${actualUsedCount}`,
      );
    }
  }
}
```

### 8.5 任务日志与监控

| 任务 | 日志级别 | 监控指标 |
|------|----------|----------|
| expireUserCoupons | INFO (正常) / ERROR (异常) | 执行次数、更新数量 |
| syncCouponStock | WARN (发现差异) / INFO (无差异) | 差异次数、差异量 |

### 8.6 定时任务目录结构

```
server/src/modules/coupon/
├── coupon.cron.ts          # 定时任务实现
├── coupon.service.ts       # 业务逻辑
└── coupon.module.ts        # 导入 ScheduleModule
```

### 8.7 二期定时任务规划

| 任务 | cron | 说明 |
|------|------|------|
| autoGrantNewUser | 用户注册后触发 | 新用户自动发券（非定时，是事件驱动） |
| couponReminder | 券到期前 3 天提醒 | 通知用户有即将过期的券 |
| stockAlert | 每小时 | 库存低于阈值时告警 |
| usageStatistics | 每天凌晨 1 点 | 统计优惠券使用率 |

---

## 9. 目录结构

```
server/src/modules/coupon/
├── coupon.entity.ts        # Coupon, UserCoupon 实体
├── coupon.dto.ts            # DTO 定义
├── coupon.service.ts        # 核心业务逻辑
├── coupon.controller.ts     # API 路由
├── coupon.module.ts         # 模块注册
├── coupon.constants.ts      # 常量定义（类型、状态）
└── coupon.utils.ts          # 工具函数（优惠计算）

server/src/modules/order/
├── order.service.ts         # 订单服务（核销时调用优惠券验证）
├── order.controller.ts      # 订单 API
└── order.dto.ts             # 创建订单 DTO（含 coupon_id）
```

---

## 10. 一期功能清单

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 券类型扩展 | 支持满减券、折扣券、无门槛券 |
| P0 | 核销验证 | OrderService 调用 CouponService 验证 |
| P0 | 优惠计算 | 订单金额计算 |
| P0 | 管理端 CRUD | 优惠券的增删改查 |
| P1 | 用户领取 | 主动领取功能完善 |
| P1 | 管理员发放 | 后台手动发放 |
| P1 | 自动发放 | 新用户注册自动发券 |
| P1 | 我的优惠券 | 状态筛选、列表展示 |
| P2 | 前端选券页 | 结算页选择优惠券 |

---

## 11. 二期规划

| 功能 | 说明 |
|------|------|
| 指定商品/分类 | 优惠券适用范围精细化 |
| 领取后 N 天生效 | 相对有效期 |
| 口令兑换 | 兑换码领取 |
| 会员专属券 | 等级差异化 |
| 限时秒杀券 | 定时抢购 |
