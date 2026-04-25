import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderService, ORDER_PAY_STATUS } from '../order/order.service';
import { PaymentRecord } from './payment.entity';
import { CreatePaymentDto } from './payment.dto';
import { PaymentGatewaySelector } from './payment.gateway.selector';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentRecord)
    private readonly paymentRepository: Repository<PaymentRecord>,
    private readonly orderService: OrderService,
    private readonly paymentGatewaySelector: PaymentGatewaySelector,
  ) {}

  async create(userId: number, dto: CreatePaymentDto) {
    const order = await this.orderService.getById(dto.order_id);
    if (order.user_id !== userId) {
      throw new BadRequestException('订单不属于当前用户');
    }
    if (order.status !== 'pending') {
      throw new BadRequestException('当前订单状态不允许发起支付');
    }
    if (order.pay_status === ORDER_PAY_STATUS.PAID) {
      return {
        order_id: order.id,
        order_no: order.order_no,
        pay_status: order.pay_status,
        message: '订单已支付',
      };
    }

    const outTradeNo = order.out_trade_no || this.generateOutTradeNo(order.id);
    const updatedOrder = await this.orderService.markPaying(order.id, {
      pay_channel: dto.pay_channel,
      pay_scene: dto.pay_scene,
      out_trade_no: outTradeNo,
    });

    const gateway = this.paymentGatewaySelector.getGateway();
    const clientPayload = await gateway.createClientPayload({
      order_no: updatedOrder.order_no,
      out_trade_no: outTradeNo,
      pay_channel: dto.pay_channel,
      pay_scene: dto.pay_scene,
      amount: Number(updatedOrder.pay_amount),
    });

    const existing = await this.paymentRepository.findOne({ where: { out_trade_no: outTradeNo } });
    if (existing) {
      existing.status = 'paying';
      existing.pay_channel = dto.pay_channel;
      existing.pay_scene = dto.pay_scene;
      existing.client_payload = JSON.stringify(clientPayload);
      existing.amount = Number(updatedOrder.pay_amount);
      await this.paymentRepository.save(existing);
    } else {
      const record = this.paymentRepository.create({
        order_id: updatedOrder.id,
        order_no: updatedOrder.order_no,
        user_id: updatedOrder.user_id,
        pay_channel: dto.pay_channel,
        pay_scene: dto.pay_scene,
        status: 'paying',
        out_trade_no: outTradeNo,
        amount: Number(updatedOrder.pay_amount),
        client_payload: JSON.stringify(clientPayload),
      });
      await this.paymentRepository.save(record);
    }

    return {
      order_id: updatedOrder.id,
      order_no: updatedOrder.order_no,
      out_trade_no: outTradeNo,
      pay_status: updatedOrder.pay_status,
      pay_channel: dto.pay_channel,
      pay_scene: dto.pay_scene,
      amount: Number(updatedOrder.pay_amount),
      pay_params: clientPayload,
      pay_mode: this.paymentGatewaySelector.getCurrentMode(),
    };
  }

  async getStatus(orderId: number, userId?: number) {
    const order = await this.orderService.getById(orderId);
    if (userId && order.user_id !== userId) {
      throw new BadRequestException('订单不属于当前用户');
    }
    const latestPayment = await this.paymentRepository.findOne({
      where: { order_id: orderId },
      order: { created_at: 'DESC' },
    });

    return {
      order_id: order.id,
      order_no: order.order_no,
      status: order.status,
      pay_status: order.pay_status,
      pay_channel: order.pay_channel,
      out_trade_no: order.out_trade_no,
      third_trade_no: order.third_trade_no,
      paid_at: order.paid_at || order.pay_time,
      payment: latestPayment || null,
    };
  }

  async handleNotify(channel: string, payload: any) {
    const outTradeNo = payload?.out_trade_no;
    if (!outTradeNo) {
      throw new BadRequestException('缺少 out_trade_no');
    }

    const payment = await this.paymentRepository.findOne({ where: { out_trade_no: outTradeNo } });
    if (!payment) {
      throw new NotFoundException('支付单不存在');
    }

    const gateway = this.paymentGatewaySelector.getGateway();
    const parsedNotify = gateway.parseNotify(channel, payload);
    const notifyAt = new Date();
    const notifyPayload = JSON.stringify(payload || {});

    if (parsedNotify.success) {
      if (payment.status === 'paid') {
        return { success: true, idempotent: true };
      }

      const thirdTradeNo = parsedNotify.third_trade_no || `third_${Date.now()}`;
      await this.orderService.markPaid(payment.order_id, {
        third_trade_no: thirdTradeNo,
        notify_payload: notifyPayload,
        notify_at: notifyAt,
      });

      payment.status = 'paid';
      payment.third_trade_no = thirdTradeNo;
      payment.notify_payload = notifyPayload;
      payment.notify_at = notifyAt;
      payment.paid_at = new Date(parsedNotify.paid_at || Date.now());
      await this.paymentRepository.save(payment);
      return { success: true };
    }

    await this.orderService.markPayFailed(payment.order_id, parsedNotify.reason || '支付失败', notifyPayload);
    payment.status = 'failed';
    payment.notify_payload = notifyPayload;
    payment.notify_at = notifyAt;
    await this.paymentRepository.save(payment);
    return { success: true };
  }

  async mockSuccess(outTradeNo: string, payChannel?: string, thirdTradeNo?: string) {
    if (this.paymentGatewaySelector.getCurrentMode() !== 'mock') {
      throw new BadRequestException('仅 PAY_MODE=mock 时允许使用 mock/success');
    }
    const payment = await this.paymentRepository.findOne({ where: { out_trade_no: outTradeNo } });
    if (!payment) {
      throw new NotFoundException('支付单不存在');
    }
    const gateway = this.paymentGatewaySelector.getGateway();
    if (!gateway.buildSuccessNotify) {
      throw new BadRequestException('当前网关不支持 mock success');
    }
    const notify = gateway.buildSuccessNotify({
      out_trade_no: outTradeNo,
      pay_channel: payChannel || payment.pay_channel,
      third_trade_no: thirdTradeNo,
    });
    return this.handleNotify(payChannel || payment.pay_channel, notify);
  }

  private generateOutTradeNo(orderId: number) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `P${y}${m}${d}${h}${min}${s}${orderId}${rand}`;
  }
}
