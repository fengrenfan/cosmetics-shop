import { PaymentService } from './payment.service';
import { CreatePaymentDto, MockSuccessDto } from './payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    create(req: any, dto: CreatePaymentDto): Promise<{
        order_id: number;
        order_no: string;
        pay_status: "paid";
        message: string;
        out_trade_no?: undefined;
        pay_channel?: undefined;
        pay_scene?: undefined;
        amount?: undefined;
        pay_params?: undefined;
        pay_mode?: undefined;
    } | {
        order_id: number;
        order_no: string;
        out_trade_no: string;
        pay_status: string;
        pay_channel: string;
        pay_scene: string;
        amount: number;
        pay_params: any;
        pay_mode: string;
        message?: undefined;
    }>;
    getStatus(req: any, orderId: string): Promise<{
        order_id: number;
        order_no: string;
        status: string;
        pay_status: string;
        pay_channel: string;
        out_trade_no: string;
        third_trade_no: string;
        paid_at: Date;
        payment: import("./payment.entity").PaymentRecord;
    }>;
    notifyWechat(body: any): Promise<{
        success: boolean;
        idempotent: boolean;
    } | {
        success: boolean;
        idempotent?: undefined;
    }>;
    notifyAlipay(body: any): Promise<{
        success: boolean;
        idempotent: boolean;
    } | {
        success: boolean;
        idempotent?: undefined;
    }>;
    mockSuccess(dto: MockSuccessDto): Promise<{
        success: boolean;
        idempotent: boolean;
    } | {
        success: boolean;
        idempotent?: undefined;
    }>;
}
