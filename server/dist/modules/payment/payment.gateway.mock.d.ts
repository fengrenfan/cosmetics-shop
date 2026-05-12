import { PaymentGatewayAdapter } from './payment.gateway.types';
export declare class PaymentGatewayMock implements PaymentGatewayAdapter {
    createClientPayload(params: {
        order_no: string;
        out_trade_no: string;
        pay_channel: string;
        pay_scene: string;
        amount: number;
    }): {
        invoke_type: string;
        timeStamp: string;
        nonceStr: string;
        package: string;
        signType: string;
        paySign: string;
        mode: string;
        out_trade_no: string;
        order_no: string;
        amount: number;
        pay_channel: string;
        pay_scene: string;
    } | {
        invoke_type: string;
        mweb_url: string;
        mode: string;
        out_trade_no: string;
        order_no: string;
        amount: number;
        pay_channel: string;
        pay_scene: string;
    } | {
        invoke_type: string;
        form_url: string;
        mode: string;
        out_trade_no: string;
        order_no: string;
        amount: number;
        pay_channel: string;
        pay_scene: string;
    };
    buildSuccessNotify(payload: {
        out_trade_no: string;
        pay_channel: string;
        third_trade_no?: string;
    }): {
        event: string;
        pay_channel: string;
        out_trade_no: string;
        third_trade_no: string;
        paid_at: string;
        sign: string;
    };
    parseNotify(_payChannel: string, payload: any): {
        success: boolean;
        out_trade_no: any;
        third_trade_no: any;
        paid_at: any;
        reason: any;
    };
}
