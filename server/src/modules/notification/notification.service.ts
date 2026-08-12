import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  /**
   * 创建通知
   */
  async create(data: {
    user_id: number;
    type: string;
    title: string;
    content?: string;
    ref_type?: string;
    ref_id?: number;
  }) {
    const notif = this.notifRepo.create(data);
    return this.notifRepo.save(notif);
  }

  /**
   * 获取用户通知列表
   */
  async getUserNotifications(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.notifRepo.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { list: items, total, page, limit };
  }

  /**
   * 未读通知数
   */
  async getUnreadCount(userId: number) {
    const count = await this.notifRepo.count({
      where: { user_id: userId, is_read: 0 },
    });
    return { count };
  }

  /**
   * 标记单条已读
   */
  async markAsRead(userId: number, id: number) {
    await this.notifRepo.update({ id, user_id: userId }, { is_read: 1 });
    return { success: true };
  }

  /**
   * 全部标记已读
   */
  async markAllAsRead(userId: number) {
    await this.notifRepo.update({ user_id: userId, is_read: 0 }, { is_read: 1 });
    return { success: true };
  }

  /**
   * 订单相关通知 (供其他模块调用)
   */
  async notifyOrder(userId: number, orderId: number, orderNo: string, status: string) {
    const templates: Record<string, { title: string; content: string }> = {
      paid: { title: '订单已支付', content: `订单 ${orderNo} 已支付成功，等待商家发货` },
      shipped: { title: '订单已发货', content: `订单 ${orderNo} 已发货，请注意查收` },
      completed: { title: '订单已完成', content: `订单 ${orderNo} 已确认收货，感谢您的购买` },
    };

    const tpl = templates[status];
    if (!tpl) return;

    await this.create({
      user_id: userId,
      type: `order_${status}`,
      title: tpl.title,
      content: tpl.content,
      ref_type: 'order',
      ref_id: orderId,
    });
  }

  /**
   * 售后通知
   */
  async notifyAfterSale(userId: number, afterSaleId: number, refundNo: string, status: string) {
    const templates: Record<string, { title: string; content: string }> = {
      approved: { title: '售后申请已通过', content: `售后单 ${refundNo} 已审批通过，等待退款` },
      rejected: { title: '售后申请已拒绝', content: `售后单 ${refundNo} 审批未通过` },
      refunded: { title: '退款已完成', content: `售后单 ${refundNo} 退款已到账` },
    };

    const tpl = templates[status];
    if (!tpl) return;

    await this.create({
      user_id: userId,
      type: `after_sale_${status}`,
      title: tpl.title,
      content: tpl.content,
      ref_type: 'after_sale',
      ref_id: afterSaleId,
    });
  }
}
