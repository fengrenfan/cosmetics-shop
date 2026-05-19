import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Order } from '../order/order.entity';
import { MemberLevel } from './member-level.entity';
import { PerformancePeriod } from './performance-period.entity';
import { DepartmentPerformance } from './department-performance.entity';
import {
  CreateMemberLevelDto,
  CreatePerformancePeriodDto,
  UpdateDepartmentPerformanceDto,
  UpdateMemberLevelDto,
  UpdatePerformancePeriodDto,
  UpdateUserMemberDto,
} from './member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(MemberLevel)
    private readonly levelRepo: Repository<MemberLevel>,
    @InjectRepository(PerformancePeriod)
    private readonly periodRepo: Repository<PerformancePeriod>,
    @InjectRepository(DepartmentPerformance)
    private readonly deptPerfRepo: Repository<DepartmentPerformance>,
  ) {}

  // ─── 小程序：会员中心 ───

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    let level: MemberLevel | null = null;
    if (user.member_level_id) {
      level = await this.levelRepo.findOne({ where: { id: user.member_level_id } });
    }
    if (!level) {
      level = await this.levelRepo.findOne({ where: { status: 1 }, order: { sort_order: 'ASC' } });
    }

    const orderStats = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(o.id)', 'order_count')
      .addSelect(
        'COALESCE(SUM(COALESCE(o.coupon_amount, 0) + COALESCE(o.points_money, 0)), 0)',
        'total_savings',
      )
      .where('o.user_id = :userId', { userId })
      .andWhere("o.pay_status = 'paid'")
      .getRawOne();

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      level: level
        ? {
            id: level.id,
            name: level.name,
            discount_rate: Number(level.discount_rate),
            benefit_desc: level.benefit_desc,
          }
        : null,
      order_count: parseInt(orderStats?.order_count || '0', 10),
      total_savings: parseFloat(orderStats?.total_savings || '0').toFixed(2),
    };
  }

  async getTeamStats(userId: number) {
    const allUsers = await this.userRepo.find({ select: ['id', 'parent_id'] });
    const childrenMap = new Map<number, number[]>();
    for (const u of allUsers) {
      if (u.parent_id) {
        const list = childrenMap.get(u.parent_id) || [];
        list.push(u.id);
        childrenMap.set(u.parent_id, list);
      }
    }

    const getDescendantsAtDepth = (rootId: number, maxDepth: number): number[][] => {
      const levels: number[][] = [];
      let current = childrenMap.get(rootId) || [];
      for (let d = 1; d <= maxDepth; d++) {
        levels.push([...current]);
        if (d >= maxDepth) break;
        const next: number[] = [];
        for (const id of current) {
          next.push(...(childrenMap.get(id) || []));
        }
        current = next;
      }
      return levels;
    };

    const levels = getDescendantsAtDepth(userId, 3);
    const allDescendantIds = new Set<number>();
    const collectAll = (id: number) => {
      const children = childrenMap.get(id) || [];
      for (const cid of children) {
        if (!allDescendantIds.has(cid)) {
          allDescendantIds.add(cid);
          collectAll(cid);
        }
      }
    };
    collectAll(userId);

    return {
      direct_count: levels[0]?.length || 0,
      second_count: levels[1]?.length || 0,
      third_count: levels[2]?.length || 0,
      team_total: allDescendantIds.size,
    };
  }

  async getPeriods() {
    return this.periodRepo.find({ order: { start_date: 'DESC' } });
  }

  async getDepartments(userId: number, periodId: number) {
    const period = await this.periodRepo.findOne({ where: { id: periodId } });
    if (!period) throw new NotFoundException('考核期不存在');

    const directChildren = await this.userRepo.find({
      where: { parent_id: userId },
      order: { id: 'ASC' },
    });

    const allUsers = await this.userRepo.find({ select: ['id', 'parent_id'] });
    const childrenMap = new Map<number, number[]>();
    for (const u of allUsers) {
      if (u.parent_id) {
        const list = childrenMap.get(u.parent_id) || [];
        list.push(u.id);
        childrenMap.set(u.parent_id, list);
      }
    }

    const getSubtreeIds = (rootId: number): number[] => {
      const result: number[] = [rootId];
      const children = childrenMap.get(rootId) || [];
      for (const cid of children) {
        result.push(...getSubtreeIds(cid));
      }
      return result;
    };

    const departments = [];
    let index = 0;
    for (const child of directChildren) {
      index++;
      const snapshot = await this.deptPerfRepo.findOne({
        where: { owner_user_id: userId, direct_user_id: child.id, period_id: periodId },
      });

      let totalMembers: number;
      let totalPerformance: number;
      let effectivePerformance: number;
      let status: number;

      if (snapshot) {
        totalMembers = snapshot.total_members;
        totalPerformance = Number(snapshot.total_performance);
        effectivePerformance = Number(snapshot.effective_performance);
        status = snapshot.status;
      } else {
        const subtreeIds = getSubtreeIds(child.id);
        totalMembers = subtreeIds.length;
        const perf = await this.calcPeriodPerformance(subtreeIds, period);
        totalPerformance = perf.total;
        effectivePerformance = perf.effective;
        status = effectivePerformance >= Number(period.qualified_threshold) ? 1 : 0;
      }

      let childLevel: MemberLevel | null = null;
      if (child.member_level_id) {
        childLevel = await this.levelRepo.findOne({ where: { id: child.member_level_id } });
      }

      departments.push({
        id: snapshot?.id || null,
        dept_name: snapshot?.dept_name || `销售部门${index}`,
        direct_user: {
          id: child.id,
          nickname: child.nickname,
          phone: child.phone,
          level_name: childLevel?.name || '普通会员',
        },
        total_members: totalMembers,
        total_performance: totalPerformance.toFixed(2),
        effective_performance: effectivePerformance.toFixed(2),
        status,
        status_text: status === 1 ? '合格' : '不合格',
      });
    }

    return { period, departments };
  }

  private async calcPeriodPerformance(
    userIds: number[],
    period: PerformancePeriod,
  ): Promise<{ total: number; effective: number }> {
    if (!userIds.length) return { total: 0, effective: 0 };

    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.pay_amount), 0)', 'total')
      .addSelect(
        "COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') THEN o.pay_amount ELSE 0 END), 0)",
        'effective',
      )
      .where('o.user_id IN (:...userIds)', { userIds })
      .andWhere("o.pay_status = 'paid'")
      .andWhere('DATE(o.paid_at) >= :startDate', { startDate: period.start_date })
      .andWhere('DATE(o.paid_at) <= :endDate', { endDate: period.end_date })
      .getRawOne();

    return {
      total: parseFloat(result?.total || '0'),
      effective: parseFloat(result?.effective || '0'),
    };
  }

  // ─── 管理后台：等级 ───

  async getLevelList() {
    return this.levelRepo.find({ order: { sort_order: 'ASC' } });
  }

  async createLevel(dto: CreateMemberLevelDto) {
    const level = this.levelRepo.create(dto);
    return this.levelRepo.save(level);
  }

  async updateLevel(id: number, dto: UpdateMemberLevelDto) {
    await this.levelRepo.update(id, dto);
    return this.levelRepo.findOne({ where: { id } });
  }

  async deleteLevel(id: number) {
    await this.levelRepo.delete(id);
    return { success: true };
  }

  // ─── 管理后台：考核期 ───

  async getPeriodList() {
    return this.periodRepo.find({ order: { start_date: 'DESC' } });
  }

  async createPeriod(dto: CreatePerformancePeriodDto) {
    const period = this.periodRepo.create(dto);
    return this.periodRepo.save(period);
  }

  async updatePeriod(id: number, dto: UpdatePerformancePeriodDto) {
    await this.periodRepo.update(id, dto);
    return this.periodRepo.findOne({ where: { id } });
  }

  async deletePeriod(id: number) {
    await this.periodRepo.delete(id);
    return { success: true };
  }

  // ─── 管理后台：部门业绩 ───

  async getAdminDepartments(ownerUserId: number, periodId: number) {
    return this.getDepartments(ownerUserId, periodId);
  }

  async upsertDepartmentPerformance(
    ownerUserId: number,
    directUserId: number,
    periodId: number,
    dto: UpdateDepartmentPerformanceDto,
  ) {
    let record = await this.deptPerfRepo.findOne({
      where: { owner_user_id: ownerUserId, direct_user_id: directUserId, period_id: periodId },
    });
    if (record) {
      await this.deptPerfRepo.update(record.id, dto);
      return this.deptPerfRepo.findOne({ where: { id: record.id } });
    }
    record = this.deptPerfRepo.create({
      owner_user_id: ownerUserId,
      direct_user_id: directUserId,
      period_id: periodId,
      ...dto,
    });
    return this.deptPerfRepo.save(record);
  }

  async updateDepartmentPerformance(id: number, dto: UpdateDepartmentPerformanceDto) {
    await this.deptPerfRepo.update(id, dto);
    return this.deptPerfRepo.findOne({ where: { id } });
  }

  async deleteDepartmentPerformance(id: number) {
    await this.deptPerfRepo.delete(id);
    return { success: true };
  }

  // ─── 管理后台：用户会员信息 ───

  async updateUserMember(userId: number, dto: UpdateUserMemberDto) {
    await this.userRepo.update(userId, dto);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    let level: MemberLevel | null = null;
    if (user.member_level_id) {
      level = await this.levelRepo.findOne({ where: { id: user.member_level_id } });
    }

    let parent: User | null = null;
    if (user.parent_id) {
      parent = await this.userRepo.findOne({
        where: { id: user.parent_id },
        select: ['id', 'nickname', 'phone'],
      });
    }

    return {
      ...user,
      level_name: level?.name,
      parent_nickname: parent?.nickname,
    };
  }

  async getUserMemberDetail(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const [profile, teamStats] = await Promise.all([
      this.getProfile(userId),
      this.getTeamStats(userId),
    ]);

    let parent: User | null = null;
    if (user.parent_id) {
      parent = await this.userRepo.findOne({
        where: { id: user.parent_id },
        select: ['id', 'nickname', 'phone'],
      });
    }

    const directChildren = await this.userRepo.find({
      where: { parent_id: userId },
      select: ['id', 'nickname', 'phone', 'member_level_id', 'created_at'],
    });

    const levelIds = directChildren.map((c) => c.member_level_id).filter(Boolean);
    const levels =
      levelIds.length > 0
        ? await this.levelRepo.find({ where: { id: In(levelIds) } })
        : [];
    const levelMap = new Map(levels.map((l) => [l.id, l.name]));

    return {
      ...profile,
      parent_id: user.parent_id,
      parent: parent ? { id: parent.id, nickname: parent.nickname, phone: parent.phone } : null,
      team_stats: teamStats,
      direct_children: directChildren.map((c) => ({
        id: c.id,
        nickname: c.nickname,
        phone: c.phone,
        level_name: c.member_level_id ? levelMap.get(c.member_level_id) : '普通会员',
        created_at: c.created_at,
      })),
    };
  }

  async recalculateDepartments(ownerUserId: number, periodId: number) {
    const period = await this.periodRepo.findOne({ where: { id: periodId } });
    if (!period) throw new NotFoundException('考核期不存在');

    const { departments } = await this.getDepartments(ownerUserId, periodId);
    const directChildren = await this.userRepo.find({ where: { parent_id: ownerUserId } });

    for (let i = 0; i < directChildren.length; i++) {
      const child = directChildren[i];
      const dept = departments[i];
      if (!dept) continue;

      await this.upsertDepartmentPerformance(ownerUserId, child.id, periodId, {
        dept_name: dept.dept_name,
        total_members: dept.total_members,
        total_performance: parseFloat(dept.total_performance),
        effective_performance: parseFloat(dept.effective_performance),
        status: dept.status,
      });
    }

    return { success: true, count: directChildren.length };
  }
}
