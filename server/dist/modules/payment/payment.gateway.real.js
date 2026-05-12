"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayReal = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let PaymentGatewayReal = class PaymentGatewayReal {
    async createClientPayload(params) {
        const gatewayName = `${params.pay_channel}_${params.pay_scene}`.toUpperCase();
        const createUrl = this.getCreateUrl(params.pay_channel, params.pay_scene);
        const appId = this.getAppId(params.pay_channel, params.pay_scene);
        const mchId = this.getMerchantId(params.pay_channel);
        if (!createUrl) {
            throw new common_1.BadRequestException(`真实网关未配置创建地址: PAY_${gatewayName}_CREATE_URL`);
        }
        if (!appId || !mchId) {
            throw new common_1.BadRequestException('真实网关缺少商户配置（APP_ID/MCH_ID）');
        }
        const payload = {
            app_id: appId,
            mch_id: mchId,
            out_trade_no: params.out_trade_no,
            order_no: params.order_no,
            total_fee: Math.round(Number(params.amount) * 100),
            total_amount: Number(params.amount),
            pay_channel: params.pay_channel,
            pay_scene: params.pay_scene,
            notify_url: this.getNotifyUrl(params.pay_channel),
            return_url: this.getReturnUrl(params.pay_channel),
            mode: process.env.PAY_MODE || 'prod',
        };
        const response = await axios_1.default.post(createUrl, payload, {
            timeout: Number(process.env.PAY_GATEWAY_TIMEOUT_MS || 8000),
        });
        if (!response?.data) {
            throw new common_1.BadRequestException('支付网关返回为空');
        }
        return response.data;
    }
    parseNotify(payChannel, payload) {
        const outTradeNo = payload?.out_trade_no || payload?.outTradeNo || payload?.data?.out_trade_no;
        const paidAt = payload?.paid_at || payload?.success_time || payload?.gmt_payment || payload?.paidAt;
        const thirdTradeNo = payload?.third_trade_no || payload?.transaction_id || payload?.trade_no;
        const success = payload?.success === true ||
            payload?.status === 'SUCCESS' ||
            payload?.trade_status === 'TRADE_SUCCESS' ||
            payload?.result_code === 'SUCCESS';
        if (!outTradeNo) {
            throw new common_1.BadRequestException(`${payChannel} 回调缺少 out_trade_no`);
        }
        return {
            success,
            out_trade_no: outTradeNo,
            third_trade_no: thirdTradeNo,
            paid_at: paidAt,
            reason: payload?.reason || payload?.err_msg || payload?.sub_msg,
        };
    }
    getCreateUrl(payChannel, payScene) {
        return process.env[`PAY_${payChannel.toUpperCase()}_${payScene.toUpperCase()}_CREATE_URL`];
    }
    getNotifyUrl(payChannel) {
        return process.env[`PAY_${payChannel.toUpperCase()}_NOTIFY_URL`] || '';
    }
    getReturnUrl(payChannel) {
        return process.env[`PAY_${payChannel.toUpperCase()}_RETURN_URL`] || '';
    }
    getAppId(payChannel, payScene) {
        return (process.env[`PAY_${payChannel.toUpperCase()}_${payScene.toUpperCase()}_APP_ID`] ||
            process.env[`PAY_${payChannel.toUpperCase()}_APP_ID`] ||
            '');
    }
    getMerchantId(payChannel) {
        return process.env[`PAY_${payChannel.toUpperCase()}_MCH_ID`] || '';
    }
};
exports.PaymentGatewayReal = PaymentGatewayReal;
exports.PaymentGatewayReal = PaymentGatewayReal = __decorate([
    (0, common_1.Injectable)()
], PaymentGatewayReal);
//# sourceMappingURL=payment.gateway.real.js.map