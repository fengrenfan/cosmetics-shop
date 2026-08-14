import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AfterSale } from './after-sale.entity';
import { CreateAfterSaleDto, AdminAfterSaleQueryDto } from './after-sale.dto';
import { Order } from '../order/order.entity';

@Injectable()
export class AfterSaleService {
  constructor(
    @InjectRepository(AfterSale)
    private readonly afterSaleRepo: Repository<AfterSale>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  /**
   * 用户申请售后
   */
  async create(userId: number, dto: CreateAfterSaleDto) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.order_id, user_id: userId },
    });
    if (!order) throw new NotFoundException('订单不存在');

    // 只有已支付/已完成的订单可以申请售后
    if (!['paid', 'shipped', 'completed'].includes(order.status)) {
      throw new BadRequestException('当前订单状态不可申请售后');
    }

    // 检查是否已有进行中的售后
    const existing = await this.afterSaleRepo.findOne({
      where: { order_id: dto.order_id, user_id: userId, status: 'pending' as any },
    });
    if (existing) throw new BadRequestException('已有进行中的售后申请');

    // 校验退款金额不超过订单金额
    if (dto.refund_amount > order.pay_amount) {
      throw new BadRequestException('退款金额不能超过订单金额');
    }

    const afterSale = this.afterSaleRepo.create({
      refund_no: 'AS' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase(),
      user_id: userId,
      order_id: dto.order_id,
      order_item_ids: dto.order_item_ids || [],
      type: dto.type,
      refund_amount: dto.refund_amount,
      reason: dto.reason,
      description: dto.description || '',
      images: dto.images || [],
      status: 'pending',
    });

    return this.afterSaleRepo.save(afterSale);
  }

  /**
   * 用户 — 我的售后列表
   */
  async getMine(userId: number, page = 1, limit = 10) {
    const [items, total] = await this.afterSaleRepo.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { list: items, total, page, limit };
  }

  /**
   * 用户 — 售后详情
   */
  async getDetail(userId: number, id: number) {
    const item = await this.afterSaleRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!item) throw new NotFoundException('售后记录不存在');
    return item;
  }

  /**
   * 用户 — 查询可申请售后的订单
   */
  async getRefundableOrders(userId: number) {
    const orders = await this.orderRepo.find({
      where: { user_id: userId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });

    // 过滤可申请售后的订单
    const refundable = orders.filter(o =>
      ['paid', 'shipped', 'completed'].includes(o.status)
    );

    // 检查哪些已有售后
    const orderIds = refundable.map(o => o.id);
    if (orderIds.length === 0) return [];

    const existingAfterSales = await this.afterSaleRepo
      .createQueryBuilder('a')
      .where('a.order_id IN (:...ids)', { ids: orderIds })
      .andWhere('a.status NOT IN (:...statuses)', { statuses: ['rejected', 'refunded'] })
      .getMany();

    const existingOrderIds = new Set(existingAfterSales.map(a => a.order_id));

    return refundable
      .filter(o => !existingOrderIds.has(o.id))
      .map(o => ({
        id: o.id,
        order_no: o.order_no,
        pay_amount: o.pay_amount,
        status: o.status,
        items: o.items,
        created_at: o.created_at,
      }));
  }

  /**
   * 管理后台 — 售后列表
   */
  async adminList(query: AdminAfterSaleQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { status, keyword } = query;

    const qb = this.afterSaleRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'u')
      .leftJoin('a.order', 'o');

    if (status) {
      qb.andWhere('a.status = :status', { status });
    }
    if (keyword) {
      qb.andWhere('(a.refund_no LIKE :kw OR u.phone LIKE :kw OR o.order_no LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }

    qb.orderBy('a.created_at', 'DESC');

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { list: items, total, page, limit };
  }

  /**
   * 管理后台 — 审批通过
   */
  async approve(id: number, adminRemark?: string) {
    const item = await this.afterSaleRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('售后记录不存在');
    if (item.status !== 'pending') throw new BadRequestException('当前状态不可操作');

    item.status = 'approved';
    item.admin_remark = adminRemark || '';
    item.process_time = new Date();
    return this.afterSaleRepo.save(item);
  }

  /**
   * 管理后台 — 审批拒绝
   */
  async reject(id: number, adminRemark?: string) {
    const item = await this.afterSaleRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('售后记录不存在');
    if (item.status !== 'pending') throw new BadRequestException('当前状态不可操作');

    item.status = 'rejected';
    item.admin_remark = adminRemark || '';
    item.process_time = new Date();
    return this.afterSaleRepo.save(item);
  }

  /**
   * 管理后台 — 执行退款 (标记为已退款)
   */
  async confirmRefund(id: number, adminRemark?: string) {
    const item = await this.afterSaleRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('售后记录不存在');
    if (item.status !== 'approved') throw new BadRequestException('需先审批通过');

    item.status = 'refunded';
    item.admin_remark = adminRemark || '';
    item.process_time = new Date();

    // 更新订单状态
    await this.orderRepo.update(item.order_id, {
      status: 'refunded' as any,
      pay_status: 'refunded',
    });

    return this.afterSaleRepo.save(item);
  }
}
