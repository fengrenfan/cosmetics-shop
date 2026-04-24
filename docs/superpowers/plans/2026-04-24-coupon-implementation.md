# 优惠券系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的优惠券系统，支持满减券、折扣券、无门槛券三种类型，涵盖领取、发放、核销全流程

**Architecture:** 采用简洁分层设计，CouponService 管"发"（领取/发放/管理），OrderService 管"用"（核销时调用验证），通过定时任务处理过期状态

**Tech Stack:** NestJS + TypeORM + MySQL, uni-app (Vue3)

---

## 文件结构

```
server/src/modules/coupon/
├── coupon.entity.ts          # 修改: 新增 type, max_discount, auto_grant, source 字段
├── coupon.dto.ts             # 创建: DTO 定义
├── coupon.service.ts         # 修改: 新增 validateForOrder, applyToOrder, markAsUsed, grantToUser, autoGrant
├── coupon.controller.ts      # 修改: 新增 validate, apply, grant 端点
├── coupon.module.ts          # 修改: 导入 ScheduleModule
├── coupon.cron.ts            # 创建: 定时任务（过期处理）
├── coupon.constants.ts       # 创建: 常量定义（类型、状态）
└── coupon.utils.ts           # 创建: 工具函数（优惠计算）

server/src/modules/order/
├── order.service.ts         # 修改: 下单时调用优惠券验证和核销
├── order.entity.ts          # 修改: 新增 coupon_id 字段
└── dto/create-order.dto.ts  # 修改: 新增 couponId 参数

server/src/modules/user/
└── user.service.ts          # 修改: 新用户注册时触发自动发券

miniapp/src/pages/coupon/
├── list.vue                 # 创建: 领券中心页
├── mine.vue                 # 创建: 我的优惠券页
└── select.vue               # 创建: 优惠券选择页

miniapp/src/stores/
└── coupon.js               # 创建: 优惠券状态管理
```

---

## Task 1: 更新 Coupon Entity

**Files:**
- Modify: `server/src/modules/coupon/coupon.entity.ts`

- [ ] **Step 1: 查看现有 entity 结构**

```typescript
// 当前 coupon.entity.ts 已有字段:
// id, title, type, value, min_amount, max_discount, total_count,
// used_count, per_limit, start_time, end_time, status, created_at, updated_at
// UserCoupon: id, user_id, coupon_id, status, claimed_at, used_at, order_id
```

- [ ] **Step 2: 更新 Coupon 实体，新增 auto_grant 字段**

```typescript
// 在 coupon.entity.ts 的 Coupon 类中新增字段
@Column({ default: 0, name: 'auto_grant' })
auto_grant: number; // 0:否 1:新用户注册 2:首单
```

- [ ] **Step 3: 更新 UserCoupon 实体，新增 source 字段**

```typescript
// 在 UserCoupon 类中新增字段
@Column({ length: 20, default: 'claim', name: 'source' })
source: string; // 'claim'领取 'admin'管理员发放 'auto'自动发放
```

- [ ] **Step 4: 运行 TypeORM 同步（生成迁移或自动同步）**

```bash
cd /Users/fengrenfan/feng_pro/cosmetics-shop/server
npm run start:dev
# 观察日志确认实体同步成功
```

- [ ] **Step 5: 提交**

```bash
git add server/src/modules/coupon/coupon.entity.ts
git commit -m "feat(coupon): add auto_grant and source fields"
```

---

## Task 2: 创建优惠券常量文件

**Files:**
- Create: `server/src/modules/coupon/coupon.constants.ts`

- [ ] **Step 1: 创建常量文件**

```typescript
// coupon.constants.ts

// 优惠券类型
export const COUPON_TYPE = {
  CASH: 'cash',           // 满减券
  DISCOUNT: 'discount',   // 折扣券
  NO_THRESHOLD: 'noThreshold', // 无门槛券
} as const;

export type CouponType = typeof COUPON_TYPE[keyof typeof COUPON_TYPE];

// 用户券状态
export const USER_COUPON_STATUS = {
  UNUSED: 'unused',     // 待使用
  USED: 'used',         // 已使用
  EXPIRED: 'expired',    // 已过期
} as const;

export type UserCouponStatus = typeof USER_COUPON_STATUS[keyof typeof USER_COUPON_STATUS];

// 用户券来源
export const USER_COUPON_SOURCE = {
  CLAIM: 'claim',       // 主动领取
  ADMIN: 'admin',       // 管理员发放
  AUTO: 'auto',         // 自动发放
} as const;

export type UserCouponSource = typeof USER_COUPON_SOURCE[keyof typeof USER_COUPON_SOURCE];

// 自动发放触发类型
export const AUTO_GRANT_TRIGGER = {
  NONE: 0,          // 不自动发放
  NEW_USER: 1,      // 新用户注册
  FIRST_ORDER: 2,   // 首单
} as const;

// 验证错误码
export const VALIDATION_ERROR_CODE = {
  NO_STOCK: 'NO_STOCK',
  EXPIRED: 'EXPIRED',
  NOT_CLAIMED: 'NOT_CLAIMED',
  BELOW_MIN_AMOUNT: 'BELOW_MIN_AMOUNT',
  ALREADY_USED: 'ALREADY_USED',
  CLAIM_EXCEEDED: 'CLAIM_EXCEEDED',
} as const;
```

- [ ] **Step 2: 提交**

```bash
git add server/src/modules/coupon/coupon.constants.ts
git commit -m "feat(coupon): add constants for types and status"
```

---

## Task 3: 创建优惠券工具函数

**Files:**
- Create: `server/src/modules/coupon/coupon.utils.ts`

- [ ] **Step 1: 创建优惠计算工具函数**

```typescript
// coupon.utils.ts
import { COUPON_TYPE } from './coupon.constants';
import { Coupon } from './coupon.entity';

export interface DiscountResult {
  discountAmount: number;  // 优惠金额
  finalAmount: number;     // 最终金额
}

/**
 * 计算优惠金额
 * @param coupon 优惠券实体
 * @param orderAmount 订单金额
 * @returns 优惠结果
 */
export function calculateDiscount(coupon: Coupon, orderAmount: number): DiscountResult {
  let discountAmount: number;

  switch (coupon.type) {
    case COUPON_TYPE.CASH:
      // 满减券: 直接减免，上限 max_discount
      discountAmount = Math.min(coupon.value, coupon.max_discount || coupon.value);
      break;

    case COUPON_TYPE.DISCOUNT:
      // 折扣券: 订单金额 * (1 - 折扣率)，上限 max_discount
      discountAmount = orderAmount * (1 - Number(coupon.value));
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
      }
      break;

    case COUPON_TYPE.NO_THRESHOLD:
      // 无门槛券: 直接减免，上限 max_discount
      discountAmount = Math.min(coupon.value, coupon.max_discount || coupon.value);
      break;

    default:
      discountAmount = 0;
  }

  // 确保优惠金额不超过订单金额
  discountAmount = Math.min(discountAmount, orderAmount);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100, // 保留两位小数
    finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
  };
}

/**
 * 检查优惠券是否在有效期内
 */
export function isCouponValid(coupon: Coupon): boolean {
  const now = new Date();
  return now >= coupon.start_time && now <= coupon.end_time && coupon.status === 1;
}
```

- [ ] **Step 2: 提交**

```bash
git add server/src/modules/coupon/coupon.utils.ts
git commit -m "feat(coupon): add discount calculation utilities"
```

---

## Task 4: 创建 DTO 文件

**Files:**
- Create: `server/src/modules/coupon/coupon.dto.ts`

- [ ] **Step 1: 创建 DTO**

```typescript
// coupon.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { COUPON_TYPE } from './coupon.constants';

// 创建优惠券 DTO
export class CreateCouponDto {
  @IsString()
  title: string;

  @IsString()
  type: string; // 'cash' | 'discount' | 'noThreshold'

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  min_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_discount?: number;

  @IsNumber()
  @Min(1)
  total_count: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  per_limit?: number;

  @IsDateString()
  @IsOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional()
  end_time?: string;

  @IsNumber()
  @IsOptional()
  auto_grant?: number; // 0:否 1:新用户注册 2:首单
}

// 更新优惠券 DTO
export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  min_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_discount?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  total_count?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  per_limit?: number;

  @IsDateString()
  @IsOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional()
  end_time?: string;

  @IsNumber()
  @IsOptional()
  status?: number;

  @IsNumber()
  @IsOptional()
  auto_grant?: number;
}

// 核销验证 DTO
export class ValidateCouponDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  coupon_id: number;

  @IsNumber()
  @Min(0)
  order_amount: number;
}

// 计算优惠 DTO
export class ApplyCouponDto {
  @IsNumber()
  coupon_id: number;

  @IsNumber()
  @Min(0)
  order_amount: number;
}

// 标记已使用 DTO
export class MarkUsedDto {
  @IsNumber()
  user_coupon_id: number;

  @IsNumber()
  order_id: number;
}

// 管理员发放 DTO
export class GrantCouponDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  coupon_id: number;
}
```

- [ ] **Step 2: 提交**

```bash
git add server/src/modules/coupon/coupon.dto.ts
git commit -m "feat(coupon): add DTOs for validation and creation"
```

---

## Task 5: 更新 CouponService

**Files:**
- Modify: `server/src/modules/coupon/coupon.service.ts`

- [ ] **Step 1: 添加新的导入和接口**

```typescript
import { COUPON_TYPE, USER_COUPON_STATUS, USER_COUPON_SOURCE, VALIDATION_ERROR_CODE } from './coupon.constants';
import { calculateDiscount, DiscountResult } from './coupon.utils';

// 添加 ValidationResult 接口（在类之前）
export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}
```

- [ ] **Step 2: 新增 validateForOrder 方法**

```typescript
/**
 * 核销前验证（被 OrderService 调用）
 */
async validateForOrder(userId: number, couponId: number, orderAmount: number): Promise<ValidationResult> {
  // 1. 检查优惠券是否存在
  const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
  if (!coupon) {
    return { valid: false, error: '优惠券不存在', code: 'NOT_FOUND' };
  }

  // 2. 库存验证
  if (coupon.used_count >= coupon.total_count) {
    return { valid: false, error: '优惠券已领完', code: VALIDATION_ERROR_CODE.NO_STOCK };
  }

  // 3. 有效期验证
  const now = new Date();
  if (now < coupon.start_time || now > coupon.end_time) {
    return { valid: false, error: '优惠券已过期', code: VALIDATION_ERROR_CODE.EXPIRED };
  }

  // 4. 门槛验证
  if (orderAmount < Number(coupon.min_amount)) {
    return {
      valid: false,
      error: `订单金额需满 ${coupon.min_amount} 元`,
      code: VALIDATION_ERROR_CODE.BELOW_MIN_AMOUNT,
    };
  }

  // 5. 用户领取验证
  const userCoupon = await this.userCouponRepository.findOne({
    where: { user_id: userId, coupon_id: couponId },
  });
  if (!userCoupon) {
    return { valid: false, error: '您还未领取该优惠券', code: VALIDATION_ERROR_CODE.NOT_CLAIMED };
  }

  // 6. 使用次数验证
  if (userCoupon.status === USER_COUPON_STATUS.USED) {
    return { valid: false, error: '该优惠券已使用', code: VALIDATION_ERROR_CODE.ALREADY_USED };
  }

  if (userCoupon.status === USER_COUPON_STATUS.EXPIRED) {
    return { valid: false, error: '该优惠券已过期', code: VALIDATION_ERROR_CODE.EXPIRED };
  }

  // 7. 限次验证
  const usedCount = await this.userCouponRepository.count({
    where: { user_id: userId, coupon_id: couponId, status: USER_COUPON_STATUS.USED },
  });
  if (usedCount >= coupon.per_limit) {
    return { valid: false, error: '已达到使用上限', code: VALIDATION_ERROR_CODE.CLAIM_EXCEEDED };
  }

  return { valid: true };
}
```

- [ ] **Step 3: 新增 applyToOrder 方法**

```typescript
/**
 * 计算优惠金额（被 OrderService 调用）
 */
async applyToOrder(couponId: number, orderAmount: number): Promise<DiscountResult> {
  const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
  if (!coupon) {
    return { discountAmount: 0, finalAmount: orderAmount };
  }
  return calculateDiscount(coupon, orderAmount);
}
```

- [ ] **Step 4: 新增 markAsUsed 方法**

```typescript
/**
 * 标记为已使用
 */
async markAsUsed(userCouponId: number, orderId: number): Promise<void> {
  const userCoupon = await this.userCouponRepository.findOne({
    where: { id: userCouponId },
  });
  if (!userCoupon) {
    throw new NotFoundException('用户优惠券不存在');
  }

  userCoupon.status = USER_COUPON_STATUS.USED;
  userCoupon.used_at = new Date();
  userCoupon.order_id = orderId;
  await this.userCouponRepository.save(userCoupon);

  // 更新已使用数量
  await this.couponRepository.increment({ id: userCoupon.coupon_id }, 'used_count', 1);
}
```

- [ ] **Step 5: 新增 grantToUser 方法**

```typescript
/**
 * 管理员发放优惠券给用户
 */
async grantToUser(userId: number, couponId: number): Promise<UserCoupon> {
  const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
  if (!coupon) {
    throw new NotFoundException('优惠券不存在');
  }

  const userCoupon = this.userCouponRepository.create({
    user_id: userId,
    coupon_id: couponId,
    status: USER_COUPON_STATUS.UNUSED,
    claimed_at: new Date(),
    source: USER_COUPON_SOURCE.ADMIN,
  });

  await this.userCouponRepository.save(userCoupon);
  await this.couponRepository.increment({ id: couponId }, 'used_count', 1);

  return userCoupon;
}
```

- [ ] **Step 6: 新增 autoGrant 方法**

```typescript
/**
 * 自动发放优惠券（新用户注册/首单触发）
 */
async autoGrant(userId: number, trigger: number): Promise<UserCoupon[]> {
  const coupons = await this.couponRepository.find({
    where: { auto_grant: trigger, status: 1 },
  });

  if (coupons.length === 0) {
    return [];
  }

  const results: UserCoupon[] = [];
  const now = new Date();

  for (const coupon of coupons) {
    // 检查是否已发放过
    const existing = await this.userCouponRepository.findOne({
      where: { user_id: userId, coupon_id: coupon.id },
    });
    if (existing) {
      continue;
    }

    const userCoupon = this.userCouponRepository.create({
      user_id: userId,
      coupon_id: coupon.id,
      status: USER_COUPON_STATUS.UNUSED,
      claimed_at: now,
      source: USER_COUPON_SOURCE.AUTO,
    });

    await this.userCouponRepository.save(userCoupon);
    await this.couponRepository.increment({ id: coupon.id }, 'used_count', 1);
    results.push(userCoupon);
  }

  return results;
}
```

- [ ] **Step 7: 更新 getAvailable 方法，补充领取状态判断**

```typescript
// 在 getAvailable 方法中，补充 status 筛选
async getAvailable(userId: number) {
  const now = new Date();

  const coupons = await this.couponRepository.find({
    where: {
      status: 1,
      start_time: LessThanOrEqual(now),
      end_time: MoreThanOrEqual(now),
    },
    order: { created_at: 'DESC' },
  });

  const userCoupons = await this.userCouponRepository.find({
    where: { user_id: userId },
  });

  const claimedMap = new Map(userCoupons.map((uc) => [uc.coupon_id, uc]));

  return coupons.map((c) => {
    const userCoupon = claimedMap.get(c.id);
    return {
      ...c,
      is_claimed: !!userCoupon,
      is_expired: userCoupon?.status === USER_COUPON_STATUS.EXPIRED,
      is_used: userCoupon?.status === USER_COUPON_STATUS.USED,
      can_claim: !userCoupon && (c.total_count - c.used_count) > 0,
    };
  });
}
```

- [ ] **Step 8: 提交**

```bash
git add server/src/modules/coupon/coupon.service.ts
git commit -m "feat(coupon): add validateForOrder, applyToOrder, markAsUsed, grantToUser, autoGrant methods"
```

---

## Task 6: 更新 CouponController

**Files:**
- Modify: `server/src/modules/coupon/coupon.controller.ts`

- [ ] **Step 1: 添加新的端点**

```typescript
// 在文件顶部添加 DTO 导入
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto, ApplyCouponDto, MarkUsedDto, GrantCouponDto } from './coupon.dto';

// 在 @Post('claim/:id') 之后添加验证端点
/**
 * 验证优惠券是否可用（结算页调用）
 * POST /api/coupon/validate
 */
@Post('validate')
async validate(@Body() dto: ValidateCouponDto) {
  return this.couponService.validateForOrder(dto.user_id, dto.coupon_id, dto.order_amount);
}

// 在管理端接口中添加发放端点
/**
 * 发放优惠券给用户 (管理员)
 * POST /api/coupon/admin/grant
 */
@Post('admin/grant')
async grant(@Body() dto: GrantCouponDto) {
  return this.couponService.grantToUser(dto.user_id, dto.coupon_id);
}
```

- [ ] **Step 2: 更新 create 端点的 DTO 类型**

```typescript
// 将 @Body() dto: any 改为
@Body() dto: CreateCouponDto
```

- [ ] **Step 3: 更新 update 端点的 DTO 类型**

```typescript
// 将 @Body() dto: any 改为
@Body() dto: UpdateCouponDto
```

- [ ] **Step 4: 提交**

```bash
git add server/src/modules/coupon/coupon.controller.ts
git commit -m "feat(coupon): add validate and grant endpoints"
```

---

## Task 7: 更新 CouponModule

**Files:**
- Modify: `server/src/modules/coupon/coupon.module.ts`

- [ ] **Step 1: 导入 ScheduleModule**

```typescript
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(), // 添加这一行
    // ... 其他 imports
  ],
})
export class CouponModule {}
```

- [ ] **Step 2: 提交**

```bash
git add server/src/modules/coupon/coupon.module.ts
git commit -m "feat(coupon): import ScheduleModule for cron jobs"
```

---

## Task 8: 创建定时任务

**Files:**
- Create: `server/src/modules/coupon/coupon.cron.ts`

- [ ] **Step 1: 创建定时任务文件**

```typescript
// coupon.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserCoupon, Coupon } from './coupon.entity';
import { USER_COUPON_STATUS } from './coupon.constants';

@Injectable()
export class CouponCron {
  private readonly logger = new Logger(CouponCron.name);

  constructor(
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  /**
   * 优惠券过期处理
   * 每天凌晨 0 点执行
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCouponExpiration() {
    this.logger.log('[Coupon Expiration] Starting...');

    try {
      const now = new Date();

      // 查找所有已过期但状态仍为 unused 的用户券
      const result = await this.userCouponRepository
        .createQueryBuilder('uc')
        .update(UserCoupon)
        .set({ status: USER_COUPON_STATUS.EXPIRED })
        .where('status = :status', { status: USER_COUPON_STATUS.UNUSED })
        .andWhere('coupon_id IN (
          SELECT id FROM coupon WHERE end_time < :now
        )', { now })
        .execute();

      this.logger.log(`[Coupon Expiration] Success: ${result.affected || 0} coupons expired`);
    } catch (error) {
      this.logger.error(`[Coupon Expiration] Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 库存同步（可选）
   * 每 30 分钟执行一次
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncCouponStock() {
    try {
      const coupons = await this.couponRepository.find();

      for (const coupon of coupons) {
        const actualUsedCount = await this.userCouponRepository.count({
          where: { coupon_id: coupon.id, status: USER_COUPON_STATUS.USED },
        });

        if (coupon.used_count !== actualUsedCount) {
          await this.couponRepository.update(coupon.id, {
            used_count: actualUsedCount,
          });
          this.logger.warn(
            `[Coupon Stock Sync] Coupon #${coupon.id} corrected: ${coupon.used_count} -> ${actualUsedCount}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`[Coupon Stock Sync] Failed: ${error.message}`);
    }
  }
}
```

- [ ] **Step 2: 在 coupon.module.ts 中注册 Cron**

```typescript
// 在 coupon.module.ts 添加
import { CouponCron } from './coupon.cron';

// 在 providers 中添加
providers: [CouponService, CouponCron],
```

- [ ] **Step 3: 提交**

```bash
git add server/src/modules/coupon/coupon.cron.ts server/src/modules/coupon/coupon.module.ts
git commit -m "feat(coupon): add cron jobs for expiration and stock sync"
```

---

## Task 9: 更新 OrderService 集成优惠券

**Files:**
- Modify: `server/src/modules/order/order.service.ts`

- [ ] **Step 1: 注入 CouponService**

```typescript
import { CouponService } from '../coupon/coupon.service';

constructor(
  @InjectRepository(Order)
  private readonly orderRepository: Repository<Order>,
  private readonly couponService: CouponService, // 添加
) {}
```

- [ ] **Step 2: 创建订单时验证优惠券**

```typescript
// 在创建订单的方法中添加
async createOrder(dto: CreateOrderDto) {
  // ... 现有的验证逻辑

  // 如果使用了优惠券，验证并计算优惠
  let discountAmount = 0;
  let userCouponId = null;

  if (dto.coupon_id) {
    const validation = await this.couponService.validateForOrder(
      dto.user_id,
      dto.coupon_id,
      dto.total_amount,
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const discount = await this.couponService.applyToOrder(dto.coupon_id, dto.total_amount);
    discountAmount = discount.discountAmount;

    // 获取用户优惠券 ID
    const userCoupon = await this.userCouponRepository.findOne({
      where: { user_id: dto.user_id, coupon_id: dto.coupon_id, status: 'unused' },
    });
    userCouponId = userCoupon?.id;
  }

  // ... 后续创建订单逻辑
}
```

- [ ] **Step 3: 订单创建成功后标记优惠券已使用**

```typescript
// 在订单创建成功后调用
if (userCouponId) {
  await this.couponService.markAsUsed(userCouponId, order.id);
}
```

- [ ] **Step 4: 提交**

```bash
git add server/src/modules/order/order.service.ts
git commit -m "feat(order): integrate coupon validation and usage"
```

---

## Task 10: 更新 UserService 触发自动发券

**Files:**
- Modify: `server/src/modules/user/user.service.ts`

- [ ] **Step 1: 注入 CouponService**

```typescript
import { CouponService } from '../coupon/coupon.service';

constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  private readonly couponService: CouponService, // 添加
) {}
```

- [ ] **Step 2: 在注册方法中触发自动发券**

```typescript
// 假设注册方法名为 create
async create(dto: CreateUserDto) {
  // ... 现有创建用户逻辑

  const user = await this.userRepository.save(this.userRepository.create(dto));

  // 新用户注册自动发券（trigger = 1）
  await this.couponService.autoGrant(user.id, 1);

  return user;
}
```

- [ ] **Step 3: 提交**

```bash
git add server/src/modules/user/user.service.ts
git commit -m "feat(user): trigger auto grant coupon on registration"
```

---

## Task 11: 创建小程序领券中心页

**Files:**
- Create: `miniapp/src/pages/coupon/list.vue`

- [ ] **Step 1: 创建领券中心页面**

```vue
<template>
  <view class="container">
    <view class="coupon-list">
      <view
        v-for="coupon in availableCoupons"
        :key="coupon.id"
        class="coupon-card"
        :class="{ disabled: coupon.is_claimed }"
      >
        <view class="coupon-left">
          <view class="coupon-value">
            <text class="symbol">¥</text>
            <text class="amount">{{ coupon.value }}</text>
            <text class="type-text">{{ getCouponTypeText(coupon.type) }}</text>
          </view>
          <view class="coupon-condition">
            <text v-if="coupon.min_amount > 0">满{{ coupon.min_amount }}元可用</text>
            <text v-else>无门槛</text>
          </view>
        </view>

        <view class="coupon-right">
          <view class="coupon-title">{{ coupon.title }}</view>
          <view class="coupon-time">
            {{ formatTime(coupon.start_time) }} - {{ formatTime(coupon.end_time) }}
          </view>
          <button
            class="claim-btn"
            :disabled="coupon.is_claimed || !coupon.can_claim"
            @click="handleClaim(coupon.id)"
          >
            {{ coupon.is_claimed ? '已领取' : coupon.can_claim ? '立即领取' : '已领完' }}
          </button>
        </view>
      </view>
    </view>

    <view v-if="availableCoupons.length === 0" class="empty">
      <text>暂无优惠券</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from 'vue';
import { request } from '@/utils/request';

const availableCoupons = ref([]);

async function fetchAvailableCoupons() {
  const userId = uni.getStorageSync('user_id');
  const res = await request.get('/api/coupon/available', { user_id: userId });
  availableCoupons.value = res.data || [];
}

async function handleClaim(couponId) {
  try {
    await request.post(`/api/coupon/claim/${couponId}`, { user_id: uni.getStorageSync('user_id') });
    uni.showToast({ title: '领取成功', icon: 'success' });
    fetchAvailableCoupons();
  } catch (e) {
    uni.showToast({ title: e.message || '领取失败', icon: 'none' });
  }
}

function getCouponTypeText(type) {
  const map = { cash: '满减', discount: '折扣', noThreshold: '无门槛' };
  return map[type] || type;
}

function formatTime(time) {
  if (!time) return '';
  const d = new Date(time);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

onLoad(() => {
  fetchAvailableCoupons();
});
</script>

<style scoped>
.container { padding: 20rpx; background: #f5f5f5; min-height: 100vh; }
.coupon-list { display: flex; flex-direction: column; gap: 20rpx; }
.coupon-card { display: flex; background: #fff; border-radius: 16rpx; overflow: hidden; }
.coupon-card.disabled { opacity: 0.6; }
.coupon-left { width: 240rpx; background: linear-gradient(135deg, #ff6b6b, #ff4757); padding: 30rpx 20rpx; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.coupon-value { display: flex; align-items: baseline; }
.symbol { font-size: 28rpx; }
.amount { font-size: 56rpx; font-weight: bold; }
.type-text { font-size: 24rpx; margin-left: 8rpx; }
.coupon-condition { font-size: 22rpx; margin-top: 10rpx; }
.coupon-right { flex: 1; padding: 24rpx; display: flex; flex-direction: column; justify-content: space-between; }
.coupon-title { font-size: 28rpx; font-weight: bold; }
.coupon-time { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.claim-btn { width: 160rpx; height: 56rpx; line-height: 56rpx; background: #ff4757; color: #fff; font-size: 24rpx; border-radius: 28rpx; margin-top: 16rpx; }
.claim-btn[disabled] { background: #ccc; }
.empty { text-align: center; padding: 100rpx; color: #999; }
</style>
```

- [ ] **Step 2: 添加页面路由（在 pages.json 中）**

```json
{
  "path": "pages/coupon/list",
  "style": {
    "navigationBarTitleText": "领券中心"
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add miniapp/src/pages/coupon/list.vue miniapp/src/pages.json
git commit -m "feat(miniapp): add coupon list page"
```

---

## Task 12: 创建我的优惠券页

**Files:**
- Create: `miniapp/src/pages/coupon/mine.vue`

- [ ] **Step 1: 创建我的优惠券页面**

```vue
<template>
  <view class="container">
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <view class="coupon-list">
      <view
        v-for="item in filteredCoupons"
        :key="item.id"
        class="coupon-card"
        :class="item.status"
      >
        <view class="coupon-left">
          <view class="coupon-value">
            <text class="symbol">¥</text>
            <text class="amount">{{ item.coupon.value }}</text>
          </view>
          <view class="coupon-condition">
            <text v-if="item.coupon.min_amount > 0">满{{ item.coupon.min_amount }}可用</text>
            <text v-else>无门槛</text>
          </view>
        </view>

        <view class="coupon-right">
          <view class="coupon-title">{{ item.coupon.title }}</view>
          <view class="coupon-time">
            {{ formatTime(item.coupon.start_time) }} - {{ formatTime(item.coupon.end_time) }}
          </view>
          <view class="status-tag" :class="item.status">
            {{ getStatusText(item.status) }}
          </view>
        </view>
      </view>
    </view>

    <view v-if="filteredCoupons.length === 0" class="empty">
      <text>暂无优惠券</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onLoad } from 'vue';
import { request } from '@/utils/request';

const tabs = [
  { label: '全部', value: '' },
  { label: '待使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' },
];

const currentTab = ref('');
const myCoupons = ref([]);

async function fetchMyCoupons() {
  const userId = uni.getStorageSync('user_id');
  const res = await request.get('/api/coupon/my', { user_id: userId });
  myCoupons.value = res.data || [];
}

const filteredCoupons = computed(() => {
  if (!currentTab.value) return myCoupons.value;
  return myCoupons.value.filter(c => c.status === currentTab.value);
});

function getStatusText(status) {
  const map = { unused: '待使用', used: '已使用', expired: '已过期' };
  return map[status] || status;
}

function formatTime(time) {
  if (!time) return '';
  const d = new Date(time);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

onLoad(() => {
  fetchMyCoupons();
});
</script>

<style scoped>
.container { padding: 20rpx; background: #f5f5f5; min-height: 100vh; }
.tabs { display: flex; background: #fff; border-radius: 16rpx; margin-bottom: 20rpx; }
.tab { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: #666; }
.tab.active { color: #ff4757; border-bottom: 4rpx solid #ff4757; }
.coupon-list { display: flex; flex-direction: column; gap: 20rpx; }
.coupon-card { display: flex; background: #fff; border-radius: 16rpx; overflow: hidden; }
.coupon-left { width: 220rpx; background: linear-gradient(135deg, #ff6b6b, #ff4757); padding: 30rpx 20rpx; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.coupon-card.used .coupon-left { background: #ccc; }
.coupon-card.expired .coupon-left { background: #999; }
.coupon-value { display: flex; align-items: baseline; }
.symbol { font-size: 24rpx; }
.amount { font-size: 48rpx; font-weight: bold; }
.coupon-condition { font-size: 20rpx; margin-top: 10rpx; }
.coupon-right { flex: 1; padding: 24rpx; display: flex; flex-direction: column; justify-content: center; }
.coupon-title { font-size: 28rpx; font-weight: bold; }
.coupon-time { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.status-tag { font-size: 22rpx; margin-top: 12rpx; color: #ff4757; }
.status-tag.used { color: #999; }
.status-tag.expired { color: #999; }
.empty { text-align: center; padding: 100rpx; color: #999; }
</style>
```

- [ ] **Step 2: 添加页面路由**

```json
{
  "path": "pages/coupon/mine",
  "style": {
    "navigationBarTitleText": "我的优惠券"
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add miniapp/src/pages/coupon/mine.vue
git commit -m "feat(miniapp): add my coupons page"
```

---

## Task 13: 创建优惠券选择页

**Files:**
- Create: `miniapp/src/pages/coupon/select.vue`

- [ ] **Step 1: 创建优惠券选择页面**

```vue
<template>
  <view class="container">
    <view class="header">
      <text class="title">选择优惠券</text>
      <text class="total">订单金额：¥{{ orderAmount }}</text>
    </view>

    <view class="coupon-list">
      <view
        v-for="item in availableCoupons"
        :key="item.id"
        class="coupon-item"
        :class="{ selected: selectedId === item.id, disabled: !item.canUse }"
        @click="handleSelect(item)"
      >
        <view class="coupon-info">
          <view class="coupon-value">¥{{ item.coupon.value }}</view>
          <view class="coupon-detail">
            <view class="coupon-title">{{ item.coupon.title }}</view>
            <view class="coupon-condition">
              <text v-if="item.coupon.min_amount > 0">满{{ item.coupon.min_amount }}元可用</text>
              <text v-else>无门槛券</text>
            </view>
          </view>
        </view>
        <view v-if="!item.canUse" class="reason">{{ item.reason }}</view>
      </view>
    </view>

    <view v-if="availableCoupons.length === 0" class="empty">
      <text>暂无可用优惠券</text>
    </view>

    <view class="footer">
      <button class="confirm-btn" @click="handleConfirm">确定</button>
      <button class="cancel-btn" @click="handleCancel">不使用优惠券</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from 'vue';
import { request } from '@/utils/request';

const orderAmount = ref(0);
const selectedId = ref(null);
const availableCoupons = ref([]);

async function fetchAvailableCoupons() {
  const userId = uni.getStorageSync('user_id');
  const res = await request.get('/api/coupon/available', { user_id: userId });
  const coupons = res.data || [];

  // 处理每个券是否可用
  availableCoupons.value = coupons.map(c => {
    if (c.is_claimed && !c.is_expired && !c.is_used) {
      // 已领取且未使用，检查门槛
      if (orderAmount.value >= c.min_amount) {
        return { ...c, id: c.id, canUse: true };
      } else {
        return { ...c, id: c.id, canUse: false, reason: `订单金额不满足最低消费${c.min_amount}元` };
      }
    } else if (c.is_claimed && (c.is_expired || c.is_used)) {
      return { ...c, id: c.id, canUse: false, reason: c.is_expired ? '已过期' : '已使用' };
    } else if (!c.is_claimed) {
      return { ...c, id: c.id, canUse: false, reason: '未领取' };
    }
    return { ...c, id: c.id, canUse: false, reason: '不可用' };
  });
}

function handleSelect(item) {
  if (!item.canUse) return;
  selectedId.value = selectedId.value === item.id ? null : item.id;
}

function handleConfirm() {
  const pages = getCurrentPages();
  const prevPage = pages[pages.length - 2];
  prevPage.setData({ selectedCouponId: selectedId.value });
  uni.navigateBack();
}

function handleCancel() {
  const pages = getCurrentPages();
  const prevPage = pages[pages.length - 2];
  prevPage.setData({ selectedCouponId: null });
  uni.navigateBack();
}

onLoad((options) => {
  orderAmount.value = parseFloat(options.amount || 0);
  fetchAvailableCoupons();
});
</script>

<style scoped>
.container { display: flex; flex-direction: column; height: 100vh; background: #f5f5f5; }
.header { padding: 30rpx; background: #fff; border-bottom: 1rpx solid #eee; }
.title { font-size: 32rpx; font-weight: bold; }
.total { font-size: 28rpx; color: #ff4757; margin-left: 30rpx; }
.coupon-list { flex: 1; padding: 20rpx; overflow-y: auto; }
.coupon-item { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; display: flex; flex-direction: column; border: 2rpx solid transparent; }
.coupon-item.selected { border-color: #ff4757; }
.coupon-item.disabled { opacity: 0.5; }
.coupon-info { display: flex; }
.coupon-value { font-size: 40rpx; font-weight: bold; color: #ff4757; width: 160rpx; }
.coupon-detail { flex: 1; }
.coupon-title { font-size: 28rpx; font-weight: bold; }
.coupon-condition { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.reason { font-size: 22rpx; color: #ff6b6b; margin-top: 12rpx; }
.empty { flex: 1; display: flex; align-items: center; justify-content: center; color: #999; }
.footer { padding: 20rpx; background: #fff; display: flex; gap: 20rpx; }
.confirm-btn { flex: 1; background: #ff4757; color: #fff; border-radius: 44rpx; }
.cancel-btn { flex: 1; background: #fff; color: #666; border: 1rpx solid #ddd; border-radius: 44rpx; }
</style>
```

- [ ] **Step 2: 添加页面路由**

```json
{
  "path": "pages/coupon/select",
  "style": {
    "navigationBarTitleText": "选择优惠券"
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add miniapp/src/pages/coupon/select.vue
git commit -m "feat(miniapp): add coupon selection page"
```

---

## Task 14: 创建优惠券 Store

**Files:**
- Create: `miniapp/src/stores/coupon.js`

- [ ] **Step 1: 创建 Store**

```javascript
import { defineStore } from 'pinia';

export const useCouponStore = defineStore('coupon', {
  state: () => ({
    myCoupons: [],
    selectedCouponId: null,
  }),

  getters: {
    unusedCoupons: (state) => state.myCoupons.filter(c => c.status === 'unused'),
    usedCoupons: (state) => state.myCoupons.filter(c => c.status === 'used'),
    expiredCoupons: (state) => state.myCoupons.filter(c => c.status === 'expired'),
  },

  actions: {
    setMyCoupons(coupons) {
      this.myCoupons = coupons;
    },
    setSelectedCoupon(id) {
      this.selectedCouponId = id;
    },
    clearSelectedCoupon() {
      this.selectedCouponId = null;
    },
  },
});
```

- [ ] **Step 2: 提交**

```bash
git add miniapp/src/stores/coupon.js
git commit -m "feat(miniapp): add coupon store"
```

---

## Task 15: 代码检查验证

**Files:**
- Modify: 相关文件添加验证逻辑

- [ ] **Step 1: 验证 CouponService 中的 validateForOrder 返回类型一致性**

检查所有返回 `ValidationResult` 的地方，错误码使用 `VALIDATION_ERROR_CODE` 常量。

- [ ] **Step 2: 验证订单创建时优惠券验证逻辑**

在 OrderService 中，确保：
1. 先调用 `validateForOrder` 验证
2. 验证通过后再调用 `applyToOrder` 计算优惠
3. 订单创建成功后调用 `markAsUsed`

- [ ] **Step 3: 验证定时任务**

```bash
# 本地测试定时任务
cd /Users/fengrenfan/feng_pro/cosmetics-shop/server
npm run start:dev
# 观察日志输出 [Coupon Expiration] Starting...
```

- [ ] **Step 4: 提交**

```bash
git add -m "chore: code review verification complete"
```

---

## 自检清单

### Spec 覆盖检查

| Spec 章节 | 对应 Task | 状态 |
|-----------|-----------|------|
| 3.1 Coupon 数据模型 | Task 1 | ✅ |
| 3.2 UserCoupon 数据模型 | Task 1 | ✅ |
| 4.1 券类型规则 | Task 3, 4 | ✅ |
| 4.2 领取规则 | Task 5 | ✅ |
| 4.3 核销验证规则 | Task 5, 9 | ✅ |
| 4.4 优惠计算 | Task 3 | ✅ |
| 5.1 用户端 API | Task 6 | ✅ |
| 5.2 管理端 API | Task 6 | ✅ |
| 6.1 领券中心页 | Task 11 | ✅ |
| 6.2 我的优惠券页 | Task 12 | ✅ |
| 6.3 优惠券选择页 | Task 13 | ✅ |
| 7.1 状态流转 | Task 5 | ✅ |
| 8 定时任务 | Task 8 | ✅ |
| 9 目录结构 | Task 1-14 | ✅ |

### 占位符检查

- [ ] 无 "TBD"、"TODO" 标记
- [ ] 无 "fill in details" 类描述
- [ ] 所有代码块均完整

### 类型一致性检查

- [ ] `ValidationResult` 接口在 Task 5 定义并使用
- [ ] `DiscountResult` 接口在 Task 3 定义并使用
- [ ] `COUPON_TYPE` 常量在 Task 2 定义并在 Task 3/5 中使用
- [ ] `USER_COUPON_STATUS` 常量在 Task 2 定义并在 Task 5/8 中使用

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-24-coupon-implementation.md`**

---

## 执行方式选择

**1. Subagent-Driven (推荐)** - 每个 Task 由独立 subagent 执行，任务间有检查点

**2. Inline Execution** - 在当前 session 中批量执行，带检查点

您选择哪种方式？