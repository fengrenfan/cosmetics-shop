import { Injectable } from '@nestjs/common';
import { PaymentGatewayAdapter } from './payment.gateway.types';

@Injectable()
export class PaymentGatewayMock implements PaymentGatewayAdapter {
  createClientPayload(params: {
    order_no: string;
    out_trade_no: string;
    pay_channel: string;
    pay_scene: string;
    amount: number;
  }) {
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

  buildSuccessNotify(payload: { out_trade_no: string; pay_channel: string; third_trade_no?: string }) {
    return {
      event: 'payment.success',
      pay_channel: payload.pay_channel,
      out_trade_no: payload.out_trade_no,
      third_trade_no: payload.third_trade_no || `mock_third_${Date.now()}`,
      paid_at: new Date().toISOString(),
      sign: 'mock-sign',
    };
  }

  parseNotify(_payChannel: string, payload: any) {
    return {
      success: payload?.event === 'payment.success' || payload?.success === true,
      out_trade_no: payload?.out_trade_no,
      third_trade_no: payload?.third_trade_no,
      paid_at: payload?.paid_at,
      reason: payload?.reason,
    };
  }
}
