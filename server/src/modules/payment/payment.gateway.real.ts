import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { CreatePaymentGatewayPayloadParams, ParsedNotifyResult, PaymentGatewayAdapter } from './payment.gateway.types';

@Injectable()
export class PaymentGatewayReal implements PaymentGatewayAdapter {
  async createClientPayload(params: CreatePaymentGatewayPayloadParams) {
    const gatewayName = `${params.pay_channel}_${params.pay_scene}`.toUpperCase();
    const createUrl = this.getCreateUrl(params.pay_channel, params.pay_scene);
    const appId = this.getAppId(params.pay_channel, params.pay_scene);
    const mchId = this.getMerchantId(params.pay_channel);

    if (!createUrl) {
      throw new BadRequestException(`真实网关未配置创建地址: PAY_${gatewayName}_CREATE_URL`);
    }
    if (!appId || !mchId) {
      throw new BadRequestException('真实网关缺少商户配置（APP_ID/MCH_ID）');
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

    const response = await axios.post(createUrl, payload, {
      timeout: Number(process.env.PAY_GATEWAY_TIMEOUT_MS || 8000),
    });

    if (!response?.data) {
      throw new BadRequestException('支付网关返回为空');
    }

    return response.data;
  }

  parseNotify(payChannel: string, payload: any): ParsedNotifyResult {
    const outTradeNo = payload?.out_trade_no || payload?.outTradeNo || payload?.data?.out_trade_no;
    const paidAt = payload?.paid_at || payload?.success_time || payload?.gmt_payment || payload?.paidAt;
    const thirdTradeNo = payload?.third_trade_no || payload?.transaction_id || payload?.trade_no;
    const success =
      payload?.success === true ||
      payload?.status === 'SUCCESS' ||
      payload?.trade_status === 'TRADE_SUCCESS' ||
      payload?.result_code === 'SUCCESS';

    if (!outTradeNo) {
      throw new BadRequestException(`${payChannel} 回调缺少 out_trade_no`);
    }

    return {
      success,
      out_trade_no: outTradeNo,
      third_trade_no: thirdTradeNo,
      paid_at: paidAt,
      reason: payload?.reason || payload?.err_msg || payload?.sub_msg,
    };
  }

  private getCreateUrl(payChannel: string, payScene: string) {
    return process.env[`PAY_${payChannel.toUpperCase()}_${payScene.toUpperCase()}_CREATE_URL`];
  }

  private getNotifyUrl(payChannel: string) {
    return process.env[`PAY_${payChannel.toUpperCase()}_NOTIFY_URL`] || '';
  }

  private getReturnUrl(payChannel: string) {
    return process.env[`PAY_${payChannel.toUpperCase()}_RETURN_URL`] || '';
  }

  private getAppId(payChannel: string, payScene: string) {
    return (
      process.env[`PAY_${payChannel.toUpperCase()}_${payScene.toUpperCase()}_APP_ID`] ||
      process.env[`PAY_${payChannel.toUpperCase()}_APP_ID`] ||
      ''
    );
  }

  private getMerchantId(payChannel: string) {
    return process.env[`PAY_${payChannel.toUpperCase()}_MCH_ID`] || '';
  }
}
