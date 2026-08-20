import * as crypto from 'crypto';
import { PaymentGatewayReal } from '../payment.gateway.real';

describe('PaymentGatewayReal.parseNotify 回调验签', () => {
  const SECRET = 'test_notify_secret';
  let gateway: PaymentGatewayReal;

  // 与 buildSign 相同的规则，供测试构造合法签名
  const makeSign = (payload: Record<string, any>) => {
    const parts: string[] = [];
    for (const key of Object.keys(payload).sort()) {
      if (key === 'sign' || key === 'signature' || key === 'signType') continue;
      const value = payload[key];
      if (value === undefined || value === null || value === '') continue;
      if (typeof value === 'object') continue;
      parts.push(`${key}=${value}`);
    }
    return crypto
      .createHash('md5')
      .update(`${parts.join('&')}&key=${SECRET}`, 'utf8')
      .digest('hex')
      .toUpperCase();
  };

  beforeEach(() => {
    gateway = new PaymentGatewayReal();
    process.env.PAY_NOTIFY_SECRET = SECRET;
    delete process.env.PAY_WECHAT_NOTIFY_SECRET;
  });

  afterEach(() => {
    delete process.env.PAY_NOTIFY_SECRET;
  });

  it('通过签名正确的成功回调', () => {
    const payload: any = { out_trade_no: 'P100', status: 'SUCCESS', third_trade_no: 'wx_1' };
    payload.sign = makeSign(payload);

    const result = gateway.parseNotify('wechat', payload);

    expect(result.success).toBe(true);
    expect(result.out_trade_no).toBe('P100');
    expect(result.third_trade_no).toBe('wx_1');
  });

  it('拒绝签名不匹配的回调', () => {
    const payload = { out_trade_no: 'P100', status: 'SUCCESS', sign: 'WRONGSIGN' };
    expect(() => gateway.parseNotify('wechat', payload)).toThrow('签名不匹配');
  });

  it('拒绝缺少签名的伪造成功回调', () => {
    const payload = { out_trade_no: 'P100', success: true };
    expect(() => gateway.parseNotify('wechat', payload)).toThrow('缺少签名');
  });

  it('未配置回调密钥时拒绝', () => {
    delete process.env.PAY_NOTIFY_SECRET;
    const payload = { out_trade_no: 'P100', success: true, sign: 'x' };
    expect(() => gateway.parseNotify('wechat', payload)).toThrow('未配置回调密钥');
  });

  it('优先使用按渠道配置的密钥', () => {
    process.env.PAY_WECHAT_NOTIFY_SECRET = 'channel_secret';
    const payload: any = { out_trade_no: 'P200', status: 'SUCCESS' };
    // 用渠道密钥算签名
    const parts = Object.keys(payload)
      .sort()
      .map((k) => `${k}=${payload[k]}`);
    payload.sign = crypto
      .createHash('md5')
      .update(`${parts.join('&')}&key=channel_secret`, 'utf8')
      .digest('hex')
      .toUpperCase();

    const result = gateway.parseNotify('wechat', payload);

    expect(result.success).toBe(true);
    delete process.env.PAY_WECHAT_NOTIFY_SECRET;
  });
});
