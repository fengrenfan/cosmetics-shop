import { CreatePaymentGatewayPayloadParams, ParsedNotifyResult, PaymentGatewayAdapter } from './payment.gateway.types';
export declare class PaymentGatewayReal implements PaymentGatewayAdapter {
    createClientPayload(params: CreatePaymentGatewayPayloadParams): Promise<any>;
    parseNotify(payChannel: string, payload: any): ParsedNotifyResult;
    private getCreateUrl;
    private getNotifyUrl;
    private getReturnUrl;
    private getAppId;
    private getMerchantId;
}
