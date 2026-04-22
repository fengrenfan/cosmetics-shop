import { OrderItem } from './order-item.entity';
export declare class Order {
    id: number;
    order_no: string;
    user_id: number;
    status: string;
    total_amount: number;
    freight_amount: number;
    pay_amount: number;
    pay_time: Date;
    ship_time: Date;
    receive_time: Date;
    complete_time: Date;
    address_id: number;
    address_snapshot: any;
    remark: string;
    express_company: string;
    express_no: string;
    coupon_amount: number;
    coupon_id: number;
    cancel_time: Date;
    cancel_reason: string;
    created_at: Date;
    updated_at: Date;
    items: OrderItem[];
}
