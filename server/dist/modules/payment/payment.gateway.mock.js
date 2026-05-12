"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayMock = void 0;
const common_1 = require("@nestjs/common");
let PaymentGatewayMock = class PaymentGatewayMock {
    createClientPayload(params) {
        const basePayload = {
            mode: process.env.PAY_MODE || 'mock',
            out_trade_no: params.out_trade_no,
            order_no: params.order_no,
            amount: Number(params.amount),
            pay_channel: params.pay_channel,
            pay_scene: params.pay_scene,
        };
        if (params.pay_scene === 'miniapp') {
            return {
                ...basePayload,
                invoke_type: 'miniapp_request_payment',
                timeStamp: String(Math.floor(Date.now() / 1000)),
                nonceStr: Math.random().toString(36).slice(2, 12),
                package: `prepay_id=mock_${params.out_trade_no}`,
                signType: 'MD5',
                paySign: `mock_sign_${params.out_trade_no}`,
            };
        }
        if (params.pay_channel === 'wechat') {
            return {
                ...basePayload,
                invoke_type: 'h5_redirect',
                mweb_url: `/mock-pay/wechat?out_trade_no=${params.out_trade_no}`,
            };
        }
        return {
            ...basePayload,
            invoke_type: 'h5_form',
            form_url: `/mock-pay/alipay?out_trade_no=${params.out_trade_no}`,
        };
    }
    buildSuccessNotify(payload) {
        return {
            event: 'payment.success',
            pay_channel: payload.pay_channel,
            out_trade_no: payload.out_trade_no,
            third_trade_no: payload.third_trade_no || `mock_third_${Date.now()}`,
            paid_at: new Date().toISOString(),
            sign: 'mock-sign',
        };
    }
    parseNotify(_payChannel, payload) {
        return {
            success: payload?.event === 'payment.success' || payload?.success === true,
            out_trade_no: payload?.out_trade_no,
            third_trade_no: payload?.third_trade_no,
            paid_at: payload?.paid_at,
            reason: payload?.reason,
        };
    }
};
exports.PaymentGatewayMock = PaymentGatewayMock;
exports.PaymentGatewayMock = PaymentGatewayMock = __decorate([
    (0, common_1.Injectable)()
], PaymentGatewayMock);
//# sourceMappingURL=payment.gateway.mock.js.map