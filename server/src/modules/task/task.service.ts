import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import axios from 'axios';
import dayjs from 'dayjs';
import { User } from '../user/user.entity';
import { PointLog } from '../points/points.entity';
import { PointsService } from '../points/points.service';
import { UserCheckin } from './user-checkin.entity';
import { UserTaskLog } from './user-task-log.entity';

const CHECKIN_POINTS = 10;
const INVITE_POINTS = 10;
const INVITE_MAX = 10;
const COMMUNITY_POINTS = 10;

type DayStatus = 'missed' | 'checked' | 'today' | 'upcoming';

function isDuplicateEntryError(err: unknown): boolean {
  const e = err as { errno?: number; code?: string; driverError?: { errno?: number } };
  const errno = e?.driverError?.errno ?? e?.errno;
  return errno === 1062 || e?.code === 'ER_DUP_ENTRY';
}

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private wxAccessToken: string | null = null;
  private wxTokenExpiresAt = 0;

  constructor(
    @InjectRepository(UserCheckin)
    private readonly checkinRepo: Repository<UserCheckin>,
    @InjectRepository(UserTaskLog)
    private readonly taskLogRepo: Repository<UserTaskLog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly pointsService: PointsService,
    private readonly dataSource: DataSource,
  ) {}

  private formatDate(d: dayjs.Dayjs): string {
    return d.format('YYYY-MM-DD');
  }

  private dayRange(dateStr: string) {
    return {
      start: dayjs(dateStr).startOf('day').toDate(),
      end: dayjs(dateStr).endOf('day').toDate(),
    };
  }

  private async hasPointReward(
    manager: EntityManager,
    userId: number,
    source: string,
    remark: string,
    dateStr: string,
  ): Promise<boolean> {
    const { start, end } = this.dayRange(dateStr);
    const found = await manager
      .getRepository(PointLog)
      .createQueryBuilder('p')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.source = :source', { source })
      .andWhere('p.remark = :remark', { remark })
      .andWhere('p.type = 1')
      .andWhere('p.created_at BETWEEN :start AND :end', { start, end })
      .getOne();
    return !!found;
  }

  /** 展示窗口：昨天起共 7 天 */
  private getDisplayDays() {
    const start = dayjs().subtract(1, 'day');
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
  }

  async getCenter(userId: number) {
    const today = dayjs();
    const todayStr = this.formatDate(today);
    const displayDays = this.getDisplayDays();
    const from = this.formatDate(displayDays[0]);
    const to = this.formatDate(displayDays[6]);

    const checkins = await this.checkinRepo
      .createQueryBuilder('c')
      .where('c.user_id = :userId', { userId })
      .andWhere('c.checkin_date BETWEEN :from AND :to', { from, to })
      .getMany();
    const checkedDates = new Set(checkins.map((c) => dayjs(c.checkin_date).format('YYYY-MM-DD')));

    const todayChecked = checkedDates.has(todayStr);
    const checkin_days = displayDays.map((d) => {
      const dateStr = this.formatDate(d);
      let status: DayStatus;
      if (d.isBefore(today, 'day')) {
        status = checkedDates.has(dateStr) ? 'checked' : 'missed';
      } else if (d.isSame(today, 'day')) {
        status = todayChecked ? 'checked' : 'today';
      } else {
        status = 'upcoming';
      }
      return {
        date: dateStr,
        label: d.format('MM/DD'),
        status,
        points: CHECKIN_POINTS,
      };
    });

    const inviteCount = await this.taskLogRepo.count({
      where: { user_id: userId, task_type: 'invite_register' },
    });

    const communityDone = await this.taskLogRepo.findOne({
      where: {
        user_id: userId,
        task_type: 'community_post',
        period_key: todayStr,
      },
    });

    const { points } = await this.pointsService.getPoints(userId);

    return {
      points,
      checkin: {
        days: checkin_days,
        today_checked: todayChecked,
        can_checkin: !todayChecked,
      },
      tasks: [
        {
          type: 'invite_register',
          title: '邀请新用户',
          description: '新用户注册成功，每位系统赠送10美点',
          current: inviteCount,
          target: INVITE_MAX,
          completed: inviteCount >= INVITE_MAX,
          points: INVITE_POINTS,
        },
        {
          type: 'community_post',
          title: '每日美圈',
          description: '每日成功发送美圈，系统赠送10美点',
          current: communityDone ? 1 : 0,
          target: 1,
          completed: !!communityDone,
          points: COMMUNITY_POINTS,
        },
      ],
    };
  }

  async checkin(userId: number) {
    const todayStr = this.formatDate(dayjs());

    return this.dataSource.transaction(async (manager) => {
      const checkinRepository = manager.getRepository(UserCheckin);

      const existing = await checkinRepository.findOne({
        where: { user_id: userId, checkin_date: todayStr },
      });

      if (existing) {
        const repaired = await this.repairCheckinReward(userId, todayStr, manager);
        if (repaired) return repaired;
        throw new BadRequestException('今日已签到');
      }

      try {
        await checkinRepository.save(
          checkinRepository.create({
            user_id: userId,
            checkin_date: todayStr,
            points: CHECKIN_POINTS,
          }),
        );
      } catch (err) {
        if (isDuplicateEntryError(err)) {
          const repaired = await this.repairCheckinReward(userId, todayStr, manager);
          if (repaired) return repaired;
          throw new BadRequestException('今日已签到');
        }
        throw err;
      }

      const { points } = await this.pointsService.addRewardPoints(
        userId,
        CHECKIN_POINTS,
        'checkin',
        '每日签到',
        undefined,
        manager,
      );

      return { points, reward: CHECKIN_POINTS };
    });
  }

  /** 签到记录存在但积分未到账时补发（事务内） */
  private async repairCheckinReward(
    userId: number,
    todayStr: string,
    manager: EntityManager,
  ): Promise<{ points: number; reward: number; repaired?: boolean } | null> {
    const hasReward = await this.hasPointReward(
      manager,
      userId,
      'checkin',
      '每日签到',
      todayStr,
    );
    if (hasReward) return null;

    const { points } = await this.pointsService.addRewardPoints(
      userId,
      CHECKIN_POINTS,
      'checkin',
      '每日签到',
      undefined,
      manager,
    );
    return { points, reward: CHECKIN_POINTS, repaired: true };
  }

  async onCommunityPost(userId: number) {
    const todayStr = this.formatDate(dayjs());

    await this.dataSource.transaction(async (manager) => {
      const taskLogRepository = manager.getRepository(UserTaskLog);

      const existing = await taskLogRepository.findOne({
        where: {
          user_id: userId,
          task_type: 'community_post',
          period_key: todayStr,
        },
      });

      if (existing) {
        await this.repairCommunityReward(userId, todayStr, manager);
        return;
      }

      try {
        await taskLogRepository.save(
          taskLogRepository.create({
            user_id: userId,
            task_type: 'community_post',
            period_key: todayStr,
            points: COMMUNITY_POINTS,
          }),
        );
      } catch (err) {
        if (isDuplicateEntryError(err)) {
          await this.repairCommunityReward(userId, todayStr, manager);
          return;
        }
        throw err;
      }

      await this.pointsService.addRewardPoints(
        userId,
        COMMUNITY_POINTS,
        'task',
        '每日美圈发帖',
        undefined,
        manager,
      );
    });
  }

  private async repairCommunityReward(
    userId: number,
    todayStr: string,
    manager: EntityManager,
  ): Promise<void> {
    const hasReward = await this.hasPointReward(
      manager,
      userId,
      'task',
      '每日美圈发帖',
      todayStr,
    );
    if (hasReward) return;

    await this.pointsService.addRewardPoints(
      userId,
      COMMUNITY_POINTS,
      'task',
      '每日美圈发帖',
      undefined,
      manager,
    );
  }

  async bindInviterOnRegister(newUserId: number, inviterId?: number) {
    if (!inviterId || inviterId === newUserId) return;

    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const taskLogRepository = manager.getRepository(UserTaskLog);

      const [lockFirst, lockSecond] =
        inviterId < newUserId ? [inviterId, newUserId] : [newUserId, inviterId];

      const first = await userRepository.findOne({
        where: { id: lockFirst },
        lock: { mode: 'pessimistic_write' },
      });
      const second = await userRepository.findOne({
        where: { id: lockSecond },
        lock: { mode: 'pessimistic_write' },
      });

      const inviter = inviterId === lockFirst ? first : second;
      const newUser = newUserId === lockFirst ? first : second;

      if (!inviter || inviter.status !== 1 || !newUser || newUser.parent_id) {
        return;
      }

      newUser.parent_id = inviterId;
      await userRepository.save(newUser);

      const periodKey = `u${newUserId}`;
      const existingLog = await taskLogRepository.findOne({
        where: {
          user_id: inviterId,
          task_type: 'invite_register',
          period_key: periodKey,
        },
      });

      if (existingLog) {
        await this.repairInviteReward(inviterId, newUserId, manager);
        return;
      }

      const inviteCount = await taskLogRepository.count({
        where: { user_id: inviterId, task_type: 'invite_register' },
      });
      if (inviteCount >= INVITE_MAX) {
        return;
      }

      try {
        await taskLogRepository.save(
          taskLogRepository.create({
            user_id: inviterId,
            task_type: 'invite_register',
            period_key: periodKey,
            ref_id: newUserId,
            points: INVITE_POINTS,
          }),
        );
      } catch (err) {
        if (isDuplicateEntryError(err)) {
          await this.repairInviteReward(inviterId, newUserId, manager);
          return;
        }
        throw err;
      }

      await this.pointsService.addRewardPoints(
        inviterId,
        INVITE_POINTS,
        'task',
        this.inviteRewardRemark(newUserId),
        undefined,
        manager,
      );
    });
  }

  private inviteRewardRemark(newUserId: number): string {
    return `邀请新用户注册#${newUserId}`;
  }

  private async repairInviteReward(
    inviterId: number,
    newUserId: number,
    manager: EntityManager,
  ): Promise<void> {
    const remark = this.inviteRewardRemark(newUserId);
    const taskLog = await manager.getRepository(UserTaskLog).findOne({
      where: {
        user_id: inviterId,
        task_type: 'invite_register',
        period_key: `u${newUserId}`,
      },
    });
    if (!taskLog) return;

    const hasReward = await manager.getRepository(PointLog).findOne({
      where: { user_id: inviterId, source: 'task', remark, type: 1 },
    });
    if (hasReward) return;

    await this.pointsService.addRewardPoints(
      inviterId,
      INVITE_POINTS,
      'task',
      remark,
      undefined,
      manager,
    );
  }

  async getInviteQrcode(userId: number) {
    const scene = `i=${userId}`;
    const page = 'pages/login/index';

    const wxImage = await this.tryWxacode(scene, page);
    if (wxImage) {
      return {
        inviter_id: userId,
        scene,
        qrcode_base64: `data:image/png;base64,${wxImage.toString('base64')}`,
        source: 'wechat',
      };
    }

    const fallback = await this.buildFallbackQrcode(scene);
    return {
      inviter_id: userId,
      scene,
      qrcode_base64: fallback,
      source: 'fallback',
    };
  }

  private async tryWxacode(scene: string, page: string): Promise<Buffer | null> {
    const appid = process.env.WX_APPID;
    const secret = process.env.WX_SECRET;
    if (!appid || !secret) return null;

    try {
      const token = await this.getWxAccessToken(appid, secret);
      const res = await axios.post(
        `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`,
        {
          scene,
          page,
          check_path: false,
          width: 280,
        },
        { responseType: 'arraybuffer', timeout: 15000 },
      );

      const contentType = res.headers['content-type'] || '';
      if (contentType.includes('json') || contentType.includes('text')) {
        const err = JSON.parse(Buffer.from(res.data).toString('utf8'));
        this.logger.warn(`wxacode failed: ${JSON.stringify(err)}`);
        return null;
      }
      return Buffer.from(res.data);
    } catch (e) {
      this.logger.warn(`wxacode error: ${e?.message || e}`);
      return null;
    }
  }

  private async getWxAccessToken(appid: string, secret: string): Promise<string> {
    if (this.wxAccessToken && Date.now() < this.wxTokenExpiresAt) {
      return this.wxAccessToken;
    }
    const res = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: { grant_type: 'client_credential', appid, secret },
    });
    if (res.data.errcode) {
      throw new BadRequestException(res.data.errmsg || '获取微信 access_token 失败');
    }
    this.wxAccessToken = res.data.access_token;
    this.wxTokenExpiresAt = Date.now() + (res.data.expires_in - 300) * 1000;
    return this.wxAccessToken;
  }

  private async buildFallbackQrcode(scene: string): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QRCode = require('qrcode');
      const payload = JSON.stringify({ type: 'invite', scene });
      return await QRCode.toDataURL(payload, { width: 280, margin: 2 });
    } catch {
      return '';
    }
  }
}
