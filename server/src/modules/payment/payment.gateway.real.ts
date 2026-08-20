import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
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
    // 验签：伪造 / 篡改的回调在此被拒绝（fail-closed）
    this.verifySign(payChannel, payload);

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

  /**
   * 校验回调签名（fail-closed：未配密钥或签名不符一律拒绝）
   *
   * 默认采用通用方案：非空标量参数按 key 字典序拼接为 k1=v1&k2=v2，
   * 末尾追加 &key=<密钥> 后做 MD5、转大写，与回调中的 sign 字段比对。
   * 密钥取自环境变量 PAY_<渠道>_NOTIFY_SECRET，回退到 PAY_NOTIFY_SECRET。
   * 接入真实支付网关时，请按其文档调整参与签名的字段与算法（见 buildSign）。
   */
  private verifySign(payChannel: string, payload: any): void {
    const secret =
      process.env[`PAY_${payChannel.toUpperCase()}_NOTIFY_SECRET`] ||
      process.env.PAY_NOTIFY_SECRET;
    if (!secret) {
      throw new BadRequestException('支付回调验签失败：未配置回调密钥');
    }

    const receivedSign = payload?.sign || payload?.signature;
    if (!receivedSign) {
      throw new BadRequestException('支付回调验签失败：缺少签名');
    }

    const expected = Buffer.from(this.buildSign(payload, secret));
    const received = Buffer.from(String(receivedSign).toUpperCase());
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      throw new BadRequestException('支付回调验签失败：签名不匹配');
    }
  }

  private buildSign(payload: any, secret: string): string {
    const parts: string[] = [];
    for (const key of Object.keys(payload).sort()) {
      if (key === 'sign' || key === 'signature' || key === 'signType') continue;
      const value = payload[key];
      if (value === undefined || value === null || value === '') continue;
      if (typeof value === 'object') continue; // 嵌套字段不参与，按实际网关调整
      parts.push(`${key}=${value}`);
    }
    const raw = `${parts.join('&')}&key=${secret}`;
    return crypto.createHash('md5').update(raw, 'utf8').digest('hex').toUpperCase();
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
