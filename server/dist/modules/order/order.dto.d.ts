export declare class OrderItemDto {
    product_id: number;
    sku_id?: number;
    quantity: number;
    cart_id?: number;
}
export declare class CreateOrderDto {
    address_id: number;
    items: OrderItemDto[];
    remark?: string;
    coupon_id?: number;
    points_amount?: number;
    points_money?: number;
    user_id?: number;
    pay_channel?: string;
    pay_scene?: string;
}
