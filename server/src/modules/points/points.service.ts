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
