"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_service_1 = require("../order/order.service");
const payment_entity_1 = require("./payment.entity");
const payment_gateway_selector_1 = require("./payment.gateway.selector");
let PaymentService = class PaymentService {
    constructor(paymentRepository, orderService, paymentGatewaySelector) {
        this.paymentRepository = paymentRepository;
        this.orderService = orderService;
        this.paymentGatewaySelector = paymentGatewaySelector;
    }
    async create(userId, dto) {
        const order = await this.orderService.getById(dto.order_id);
        if (order.user_id !== userId) {
            throw new common_1.BadRequestException('订单不属于当前用户');
        }
        if (order.status !== 'pending') {
            throw new common_1.BadRequestException('当前订单状态不允许发起支付');
        }
        if (order.pay_status === order_service_1.ORDER_PAY_STATUS.PAID) {
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
        }
        else {
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
    async getStatus(orderId, userId) {
        const order = await this.orderService.getById(orderId);
        if (userId && order.user_id !== userId) {
            throw new common_1.BadRequestException('订单不属于当前用户');
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
    async handleNotify(channel, payload) {
        const outTradeNo = payload?.out_trade_no;
        if (!outTradeNo) {
            throw new common_1.BadRequestException('缺少 out_trade_no');
        }
        const payment = await this.paymentRepository.findOne({ where: { out_trade_no: outTradeNo } });
        if (!payment) {
            throw new common_1.NotFoundException('支付单不存在');
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
    async mockSuccess(outTradeNo, payChannel, thirdTradeNo) {
        if (this.paymentGatewaySelector.getCurrentMode() !== 'mock') {
            throw new common_1.BadRequestException('仅 PAY_MODE=mock 时允许使用 mock/success');
        }
        const payment = await this.paymentRepository.findOne({ where: { out_trade_no: outTradeNo } });
        if (!payment) {
            throw new common_1.NotFoundException('支付单不存在');
        }
        const gateway = this.paymentGatewaySelector.getGateway();
        if (!gateway.buildSuccessNotify) {
            throw new common_1.BadRequestException('当前网关不支持 mock success');
        }
        const notify = gateway.buildSuccessNotify({
            out_trade_no: outTradeNo,
            pay_channel: payChannel || payment.pay_channel,
            third_trade_no: thirdTradeNo,
        });
        return this.handleNotify(payChannel || payment.pay_channel, notify);
    }
    generateOutTradeNo(orderId) {
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
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        order_service_1.OrderService,
        payment_gateway_selector_1.PaymentGatewaySelector])
], PaymentService);
//# sourceMappingURL=payment.service.js.map