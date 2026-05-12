import { Repository } from 'typeorm';
import { OrderService } from '../order/order.service';
import { PaymentRecord } from './payment.entity';
import { CreatePaymentDto } from './payment.dto';
import { PaymentGatewaySelector } from './payment.gateway.selector';
export declare class PaymentService {
    private readonly paymentRepository;
    private readonly orderService;
    private readonly paymentGatewaySelector;
    constructor(paymentRepository: Repository<PaymentRecord>, orderService: OrderService, paymentGatewaySelector: PaymentGatewaySelector);
    create(userId: number, dto: CreatePaymentDto): Promise<{
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
    getStatus(orderId: number, userId?: number): Promise<{
        order_id: number;
        order_no: string;
        status: string;
        pay_status: string;
        pay_channel: string;
        out_trade_no: string;
        third_trade_no: string;
        paid_at: Date;
        payment: PaymentRecord;
    }>;
    handleNotify(channel: string, payload: any): Promise<{
        success: boolean;
        idempotent: boolean;
    } | {
        success: boolean;
        idempotent?: undefined;
    }>;
    mockSuccess(outTradeNo: string, payChannel?: string, thirdTradeNo?: string): Promise<{
        success: boolean;
        idempotent: boolean;
    } | {
        success: boolean;
        idempotent?: undefined;
    }>;
    private generateOutTradeNo;
}
