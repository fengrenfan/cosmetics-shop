# 积分功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现商城积分功能，包括购物返积分和积分抵扣现金

**Architecture:** 
- 后端基于 NestJS + TypeORM，在订单完成时返积分，下单时扣积分
- 前端在"我的"页面显示积分余额，结算页支持输入抵扣积分数
- 积分按批次管理，每批12个月有效期，使用 FIFO 抵扣

**Tech Stack:** NestJS, TypeORM, SQLite, uni-app (Vue3)

---

## 文件结构

```
server/src/modules/
├── user/
│   ├── user.entity.ts          # 修改：增加 points 字段
│   ├── user.module.ts          # 修改：引入 PointLogModule
│   └── user.service.ts         # 增加：getPoints, addPoints, deductPoints
├── order/
│   ├── order.entity.ts         # 修改：增加 points_amount, points_money 字段
│   ├── order.service.ts        # 修改：订单完成时返积分
│   └── order.controller.ts     # 修改：下单时处理积分抵扣
├── points/
│   ├── points.entity.ts        # 新建：积分记录实体
│   ├── points.module.ts        # 新建：积分模块
│   ├── points.service.ts       # 新建：积分服务
│   ├── points.controller.ts    # 新建：积分接口
│   └── points.dto.ts          # 新建：积分 DTO

miniapp/src/pages/
├── mine/index.vue               # 修改：显示积分余额
├── order/confirm.vue           # 修改：结算页积分抵扣
└── points/logs.vue             # 新建：积分明细页面
```

---

## Task 1: 后端 - 创建积分记录实体和模块

**Files:**
- Create: `server/src/modules/points/points.entity.ts`
- Modify: `server/src/modules/user/user.entity.ts` (增加 points 字段)
- Modify: `server/src/modules/order/order.entity.ts` (增加 points_amount, points_money 字段)

- [ ] **Step 1: 创建积分记录实体**

```typescript
// server/src/modules/points/points.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('point_log')
export class PointLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ type: 'tinyint' })
  type: number; // 1=收入, 2=支出, 3=过期

  @Column()
  points: number; // 积分数量（正数）

  @Column()
  balance: number; // 变动后余额

  @Column({ length: 20 })
  source: string; // order=订单, exchange=兑换, expire=过期

  @Column({ nullable: true, name: 'order_id' })
  order_id: number; // 关联订单ID

  @Column({ length: 255, nullable: true })
  remark: string; // 备注

  @Column({ type: 'datetime', nullable: true, name: 'expired_at' })
  expired_at: Date; // 过期时间（批次过期时间）

  @Column({ type: 'datetime', name: 'deducted_at', nullable: true })
  deducted_at: Date; // 扣减时间（用于 FIFO 追踪）

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
```

- [ ] **Step 2: 修改用户实体增加 points 字段**

在 `user.entity.ts` 的 User 类中增加：
```typescript
@Column({ type: 'int', default: 0, name: 'points' })
points: number;
```

- [ ] **Step 3: 修改订单实体增加积分相关字段**

在 `order.entity.ts` 的 Order 类中增加：
```typescript
@Column({ type: 'int', default: 0, name: 'points_amount' })
points_amount: number; // 使用积分抵扣的积分数量

@Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'points_money' })
points_money: number; // 使用积分抵扣的金额
```

- [ ] **Step 4: 创建积分模块文件**

Create: `server/src/modules/points/points.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointLog } from './points.entity';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointLog, User])],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
```

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/points/ server/src/modules/user/user.entity.ts server/src/modules/order/order.entity.ts
git commit -m "feat(points): 创建积分记录实体和模块基础结构

- 新增 point_log 表结构
- 用户表增加 points 字段
- 订单表增加 points_amount, points_money 字段"
```

---

## Task 2: 后端 - 积分服务实现

**Files:**
- Create: `server/src/modules/points/points.dto.ts`
- Create: `server/src/modules/points/points.service.ts`
- Create: `server/src/modules/points/points.controller.ts`
- Modify: `server/src/modules/user/user.module.ts` (引入 PointsModule)

- [ ] **Step 1: 创建积分 DTO**

```typescript
// server/src/modules/points/points.dto.ts
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPointsDto {
  @IsNumber()
  @Type(() => Number)
  user_id: number;
}

export class CalculatePointsDto {
  @IsNumber()
  @Type(() => Number)
  total_amount: number; // 订单总金额

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  points?: number; // 要使用的积分数
}

export class DeductPointsDto {
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @IsNumber()
  @Type(() => Number)
  points: number; // 要扣减的积分数

  @IsNumber()
  @Type(() => Number)
  order_id: number; // 关联订单ID
}

export class AddPointsDto {
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @IsNumber()
  @Type(() => Number)
  points: number; // 积分数量

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order_id?: number; // 关联订单ID

  @IsOptional()
  @IsString()
  remark?: string;
}
```

- [ ] **Step 2: 创建积分服务**

```typescript
// server/src/modules/points/points.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { PointLog } from './points.entity';
import { User } from '../user/user.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointLog)
    private readonly pointLogRepository: Repository<PointLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 常量配置
  private readonly POINTS_PER_ORDER = 10; // 每笔订单固定奖励积分
  private readonly POINTS_PER_10YUAN = 1; // 每消费10元奖励1积分
  private readonly EXPIRE_MONTHS = 12; // 积分有效期（月）

  // 获取用户积分余额
  async getPoints(userId: number): Promise<{ points: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return { points: user?.points || 0 };
  }

  // 获取积分明细
  async getLogs(userId: number, page = 1, pageSize = 20) {
    const [list, total] = await this.pointLogRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      list: list.map(log => ({
        id: log.id,
        type: log.type,
        points: log.points,
        balance: log.balance,
        source: log.source,
        remark: log.remark,
        created_at: log.created_at,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  // 计算订单可用积分抵扣
  async calculateDeduction(userId: number, totalAmount: number, usePoints?: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const availablePoints = user?.points || 0;

    // 满500积分才可使用
    if (availablePoints < 500) {
      return { canUsePoints: 0, canUseMoney: 0, maxPoints: 0 };
    }

    // 计算最大可抵扣积分（100积分=1元）
    const maxMoney = Math.floor(availablePoints / 100);
    const maxDeductMoney = Math.min(maxMoney, totalAmount);
    const maxPoints = maxDeductMoney * 100;

    if (usePoints !== undefined) {
      // 验证输入的积分数
      if (usePoints > maxPoints) {
        usePoints = maxPoints;
      }
      // 必须是100的倍数
      usePoints = Math.floor(usePoints / 100) * 100;
      const deductMoney = usePoints / 100;
      return { canUsePoints: usePoints, canUseMoney: deductMoney, maxPoints };
    }

    return { canUsePoints: 0, canUseMoney: 0, maxPoints };
  }

  // 添加积分（返积分）
  async addPoints(userId: number, points: number, orderId?: number, remark?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('用户不存在');

    // 计算过期时间（12个月后）
    const expiredAt = new Date();
    expiredAt.setMonth(expiredAt.getMonth() + this.EXPIRE_MONTHS);

    // 更新用户积分
    user.points = (user.points || 0) + points;
    await this.userRepository.save(user);

    // 记录积分变动
    const log = this.pointLogRepository.create({
      user_id: userId,
      type: 1, // 收入
      points,
      balance: user.points,
      source: 'order',
      order_id: orderId,
      remark: remark || `订单返积分`,
      expired_at: expiredAt,
    });
    await this.pointLogRepository.save(log);

    return { points: user.points };
  }

  // 扣减积分（FIFO）
  async deductPoints(userId: number, points: number, orderId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('用户不存在');
    if ((user.points || 0) < points) throw new BadRequestException('积分不足');

    // FIFO: 优先扣减即将过期的批次
    const availableLogs = await this.pointLogRepository.find({
      where: {
        user_id: userId,
        type: 1, // 收入
        deducted_at: IsNull(), // 未被扣减
      },
      order: { expired_at: 'ASC' }, // 过期时间早的先扣
    });

    let remainingPoints = points;
    for (const log of availableLogs) {
      if (remainingPoints <= 0) break;
      if (log.expired_at && new Date(log.expired_at) < new Date()) continue; // 跳过已过期的

      const deductFromThis = Math.min(log.points, remainingPoints);
      if (deductFromThis > 0) {
        // 创建支出记录
        const deductLog = this.pointLogRepository.create({
          user_id: userId,
          type: 2, // 支出
          points: deductFromThis,
          balance: user.points - (points - remainingPoints + deductFromThis),
          source: 'exchange',
          order_id: orderId,
          remark: '积分兑换',
        });
        await this.pointLogRepository.save(deductLog);

        // 更新原收入记录的已扣减数量
        log.deducted_at = new Date();
        await this.pointLogRepository.save(log);

        remainingPoints -= deductFromThis;
      }
    }

    // 更新用户积分
    user.points = (user.points || 0) - points;
    await this.userRepository.save(user);

    return { points: user.points };
  }

  // 计算订单返积分
  calculateOrderPoints(payAmount: number) {
    const fixedPoints = this.POINTS_PER_ORDER;
    const spendPoints = Math.floor(payAmount / 10) * this.POINTS_PER_10YUAN;
    return fixedPoints + spendPoints;
  }
}
```

- [ ] **Step 3: 创建积分控制器**

```typescript
// server/src/modules/points/points.controller.ts
import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PointsService } from './points.service';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  // 获取积分余额
  @Get()
  async getPoints(@Req() req: any) {
    return this.pointsService.getPoints(req.user.id);
  }

  // 获取积分明细
  @Get('logs')
  async getLogs(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.pointsService.getLogs(req.user.id, +page, +pageSize);
  }

  // 计算抵扣
  @Post('calculate')
  async calculate(@Req() req: any, @Body() body: { total_amount: number; points?: number }) {
    return this.pointsService.calculateDeduction(req.user.id, body.total_amount, body.points);
  }
}
```

- [ ] **Step 4: 修改用户模块引入积分模块**

Modify: `server/src/modules/user/user.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PointsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, PointsModule], // 导出 PointsModule 供其他模块使用
})
export class UserModule {}
```

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/points/ server/src/modules/user/user.module.ts
git commit -m "feat(points): 实现积分服务基础功能

- PointsService: getPoints, getLogs, calculateDeduction, addPoints, deductPoints
- PointsController: /points, /points/logs, /points/calculate
- 计算订单返积分: 固定10积分 + 消费满10元返1积分
- FIFO 扣减积分逻辑"
```

---

## Task 3: 后端 - 订单集成返积分和扣积分

**Files:**
- Modify: `server/src/modules/order/order.service.ts`
- Modify: `server/src/modules/order/order.controller.ts`
- Modify: `server/src/modules/order/order.module.ts`

- [ ] **Step 1: 修改订单服务 - 订单完成时返积分**

在 `OrderService` 中注入 `PointsService`，在订单状态变为 completed 时调用返积分：

```typescript
// 在 order.service.ts 顶部导入
import { PointsService } from '../points/points.service';

// 在 constructor 中注入
constructor(
  @InjectRepository(Order)
  private readonly orderRepository: Repository<Order>,
  // ... 其他 repository
  private readonly pointsService: PointsService,
) {}

// 在 updateStatus 或 completeOrder 方法中，订单完成时：
async completeOrder(orderId: number) {
  const order = await this.orderRepository.findOne({ where: { id: orderId } });
  if (!order) throw new NotFoundException('订单不存在');

  order.status = 'completed';
  order.complete_time = new Date();
  await this.orderRepository.save(order);

  // 返积分
  const points = this.pointsService.calculateOrderPoints(order.pay_amount);
  await this.pointsService.addPoints(
    order.user_id,
    points,
    order.id,
    `订单 ${order.order_no} 完成返积分`
  );

  return order;
}
```

- [ ] **Step 2: 修改创建订单接口 - 处理积分抵扣**

在创建订单时，如果使用了积分抵扣，调用扣积分逻辑：

```typescript
// 在 createOrder 方法中，创建订单后立即扣减积分
if (dto.points_amount > 0) {
  try {
    await this.pointsService.deductPoints(
      userId,
      dto.points_amount,
      order.id,
    );
    order.points_amount = dto.points_amount;
    order.points_money = dto.points_money;
    await this.orderRepository.save(order);
  } catch (e) {
    // 积分扣减失败，订单已创建，需要处理
    throw new BadRequestException('积分扣减失败：' + e.message);
  }
}
```

- [ ] **Step 3: 修改订单模块导入 PointsModule**

Modify: `server/src/modules/order/order.module.ts`
```typescript
import { PointsModule } from '../points/points.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, ProductSku, Address, Coupon]), PointsModule],
  // ...
})
export class OrderModule {}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/modules/order/
git commit -m "feat(points): 集成积分到订单流程

- 订单完成(completed)时自动返积分
- 创建订单时扣减用户积分
- 订单记录使用的积分数量和抵扣金额"
```

---

## Task 4: 前端 - 我的页面显示积分

**Files:**
- Modify: `miniapp/src/pages/mine/index.vue`

- [ ] **Step 1: 确认积分显示部分已有占位结构**

查看 mine/index.vue 第 36-40 行已有：
```vue
<view class="asset-item" @click="goPoints">
  <text class="asset-num">{{ userInfo?.points || '0' }}</text>
  <text class="asset-label">积分</text>
</view>
```

- [ ] **Step 2: 添加跳转积分明细的方法**

在 methods 中添加：
```javascript
function goPoints() {
  uni.navigateTo({ url: '/pages/points/logs' });
}
```

- [ ] **Step 3: 确保页面加载时获取最新积分**

在 onShow 或 loadUserInfo 中，登录后获取用户信息时包含 points 字段即可（后端 /user/profile 已返回 points）。

- [ ] **Step 4: Commit**

```bash
git add miniapp/src/pages/mine/index.vue
git commit -m "feat(points): 我的页面显示积分余额

- 积分显示使用 userInfo.points
- 点击跳转到积分明细页面"
```

---

## Task 5: 前端 - 积分明细页面

**Files:**
- Create: `miniapp/src/pages/points/logs.vue`

- [ ] **Step 1: 创建积分明细页面**

```vue
<template>
  <view class="page">
    <view class="header">
      <text class="points-num">{{ userPoints }}</text>
      <text class="points-label">可用积分</text>
    </view>

    <view class="logs-list">
      <view class="log-item" v-for="item in logs" :key="item.id">
        <view class="log-left">
          <text class="log-type">{{ getTypeName(item.type) }}</text>
          <text class="log-time">{{ formatTime(item.created_at) }}</text>
        </view>
        <view class="log-right">
          <text class="log-points" :class="{ income: item.type === 1 }">
            {{ item.type === 1 ? '+' : '-' }}{{ item.points }}
          </text>
          <text class="log-balance">余额: {{ item.balance }}</text>
        </view>
      </view>

      <view class="empty" v-if="logs.length === 0 && !loading">
        <text>暂无积分记录</text>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '@/utils/request.js';

const userPoints = ref(0);
const logs = ref([]);
const loading = ref(false);
const page = ref(1);
const noMore = ref(false);

onShow(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const [pointsRes, logsRes] = await Promise.all([
      request.get('/points'),
      request.get('/points/logs', { page: page.value }),
    ]);
    userPoints.value = pointsRes.points || 0;
    logs.value = logsRes.list || [];
  } catch (e) {
    console.error('加载积分数据失败', e);
  } finally {
    loading.value = false;
  }
}

function getTypeName(type) {
  const map = { 1: '收入', 2: '支出', 3: '过期' };
  return map[type] || '未知';
}

function formatTime(time) {
  if (!time) return '';
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f5f5f5; }
.header {
  background: linear-gradient(135deg, #ff4a8d 0%, #ff6b9d 100%);
  color: #fff;
  padding: 60rpx 32rpx;
  text-align: center;
}
.points-num { font-size: 64rpx; font-weight: bold; }
.points-label { font-size: 24rpx; opacity: 0.8; }
.logs-list { padding: 20rpx; }
.log-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}
.log-left { display: flex; flex-direction: column; }
.log-type { font-size: 28rpx; color: #333; }
.log-time { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.log-right { display: flex; flex-direction: column; align-items: flex-end; }
.log-points { font-size: 32rpx; font-weight: bold; color: #ff4a8d; }
.log-points.income { color: #52c41a; }
.log-balance { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.empty, .loading { text-align: center; padding: 60rpx; color: #999; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add miniapp/src/pages/points/logs.vue
git commit -m "feat(points): 创建积分明细页面"
```

---

## Task 6: 前端 - 结算页积分抵扣

**Files:**
- Modify: `miniapp/src/pages/order/confirm.vue`

- [ ] **Step 1: 在结算页添加积分选择区域**

在订单确认页面（confirm.vue）中找到结算栏，添加积分输入：

```vue
<!-- 积分抵扣区域（在价格汇总上方） -->
<view class="points-section" v-if="userPoints >= 500">
  <view class="points-info">
    <text class="points-label">使用积分</text>
    <text class="points-hint">可用 {{ userPoints }} 积分（满500可用）</text>
  </view>
  <view class="points-input-wrap">
    <input
      class="points-input"
      type="number"
      v-model="usePoints"
      :max="maxUsePoints"
      @input="onPointsInput"
    />
    <text class="points-unit">积分</text>
  </view>
</view>
<view class="points-deduction" v-if="usePoints > 0">
  <text>可抵扣 ¥{{ pointsMoney }}</text>
</view>
```

- [ ] **Step 2: 添加积分相关的数据和方法**

```javascript
const userPoints = ref(0);
const usePoints = ref(0);
const maxUsePoints = ref(0);
const pointsMoney = ref(0);

async function loadPoints() {
  try {
    const res = await request.get('/points');
    userPoints.value = res.points || 0;
  } catch (e) {
    console.error('获取积分失败', e);
  }
}

function onPointsInput() {
  // 输入必须是100的倍数
  let val = parseInt(usePoints.value) || 0;
  val = Math.floor(val / 100) * 100;
  val = Math.min(val, maxUsePoints.value);
  usePoints.value = val;
  pointsMoney.value = val / 100;
}

async function calculateMaxPoints() {
  try {
    const res = await request.post('/points/calculate', {
      total_amount: totalPrice.value,
    });
    maxUsePoints.value = res.maxPoints || 0;
  } catch (e) {
    console.error('计算积分失败', e);
  }
}
```

- [ ] **Step 3: 在下单时传递积分信息**

```javascript
async function submitOrder() {
  // ... 验证地址等

  const orderData = {
    address_id: selectedAddress.value.id,
    // ... 其他字段
    points_amount: usePoints.value,
    points_money: pointsMoney.value,
  };

  const res = await request.post('/order/create', orderData);
  // ...
}
```

- [ ] **Step 4: Commit**

```bash
git add miniapp/src/pages/order/confirm.vue
git commit -m "feat(points): 结算页添加积分抵扣功能

- 显示可用积分数量
- 输入框输入要使用的积分数（100的倍数）
- 实时计算抵扣金额
- 下单时传递积分抵扣信息"
```

---

## Task 7: 编译测试

- [ ] **Step 1: 编译后端**

```bash
cd server
npm run build
```

- [ ] **Step 2: 重启后端服务**

```bash
# 先停止旧进程
lsof -i :3001 -t | xargs kill
# 启动新服务
PORT=3001 DB_HOST=118.25.192.73 DB_PORT=3306 DB_USER=cosmetics DB_PASSWORD=cosmetics123 DB_NAME=cosmetics_shop JWT_SECRET=cosmetics-shop-secret-2024 node dist/main.js &
```

- [ ] **Step 3: 测试积分接口**

```bash
# 获取积分（需要先登录获取token）
curl -X GET http://localhost:3001/api/points \
  -H "Authorization: Bearer <token>"

# 计算抵扣
curl -X POST http://localhost:3001/api/points/calculate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"total_amount": 100}'
```

- [ ] **Step 4: 前端编译测试**

```bash
cd miniapp
npm run dev
```

---

## 验证检查清单

- [ ] 后端编译无错误
- [ ] 积分余额查询接口正常返回
- [ ] 积分明细接口正常返回
- [ ] 积分计算接口正确返回最大可抵扣额度
- [ ] 订单完成后积分增加
- [ ] 使用积分下单后积分扣减
- [ ] 我的页面显示正确积分余额
- [ ] 结算页显示积分抵扣选项
- [ ] 积分明细页正常展示记录

---

## 实现顺序

建议按 Task 顺序执行：
1. Task 1 → 数据库和实体
2. Task 2 → 积分服务基础
3. Task 3 → 订单集成（依赖 1, 2）
4. Task 4 → 我的页面（依赖后端）
5. Task 5 → 积分明细页（依赖后端）
6. Task 6 → 结算页（依赖后端）
7. Task 7 → 编译测试
