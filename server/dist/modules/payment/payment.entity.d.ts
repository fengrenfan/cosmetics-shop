export declare class PaymentRecord {
    id: number;
    order_id: number;
    order_no: string;
    user_id: number;
    pay_channel: string;
    pay_scene: string;
    status: string;
    out_trade_no: string;
    third_trade_no: string;
    amount: number;
    client_payload: string;
    notify_payload: string;
    paid_at: Date;
    notify_at: Date;
    created_at: Date;
    updated_at: Date;
}
