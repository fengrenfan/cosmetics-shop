export interface CreatePaymentGatewayPayloadParams {
  order_no: string;
  out_trade_no: string;
  pay_channel: string;
  pay_scene: string;
  amount: number;
}

export interface ParsedNotifyResult {
  success: boolean;
  out_trade_no: string;
  third_trade_no?: string;
  paid_at?: string;
  reason?: string;
}

export interface PaymentGatewayAdapter {
  createClientPayload(params: CreatePaymentGatewayPayloadParams): Promise<any> | any;
  parseNotify(payChannel: string, payload: any): ParsedNotifyResult;
  buildSuccessNotify?(payload: { out_trade_no: string; pay_channel: string; third_trade_no?: string }): any;
}
