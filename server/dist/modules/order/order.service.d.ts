import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { ProductService } from '../product/product.service';
import { AddressService } from '../address/address.service';
import { CartService } from '../cart/cart.service';
import { PointsService } from '../points/points.service';
import { CouponService } from '../coupon/coupon.service';
import { UserCoupon } from '../coupon/coupon.entity';
import { CreateOrderDto } from './order.dto';
export declare const ORDER_PAY_STATUS: {
    readonly UNPAID: "unpaid";
    readonly PAYING: "paying";
    readonly PAID: "paid";
    readonly FAILED: "failed";
    readonly CLOSED: "closed";
    readonly REFUNDING: "refunding";
    readonly REFUNDED: "refunded";
};
export declare class OrderService {
    private readonly orderRepository;
    private readonly orderItemRepository;
    private readonly userCouponRepository;
    private readonly productService;
    private readonly addressService;
    private readonly cartService;
    private readonly pointsService;
    private readonly couponService;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, userCouponRepository: Repository<UserCoupon>, productService: ProductService, addressService: AddressService, cartService: CartService, pointsService: PointsService, couponService: CouponService);
    create(dto: CreateOrderDto): Promise<{
        id: number;
        order_no: string;
        pay_amount: number;
        pay_status: string;
    }>;
    getById(id: number): Promise<Order>;
    markPaying(orderId: number, params: {
        pay_channel: string;
        pay_scene: string;
        out_trade_no: string;
    }): Promise<Order>;
    markPaid(orderId: number, params: {
        third_trade_no?: string;
        notify_payload?: string;
        notify_at?: Date;
    }): Promise<Order>;
    markPayFailed(orderId: number, reason: string, notifyPayload?: string): Promise<Order>;
    markClosed(orderId: number, reason?: string): Promise<Order>;
    markRefunded(orderId: number): Promise<Order>;
    getList(query: {
        user_id: number;
        status?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        list: Order[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDetail(id: number): Promise<Order>;
    cancel(id: number, reason: string): Promise<{
        success: boolean;
    }>;
    confirm(id: number): Promise<{
        success: boolean;
    }>;
    getCount(userId: number): Promise<{
        pending: number;
        paid: number;
        shipped: number;
        completed: number;
    }>;
    getAdminList(query: {
        status?: string;
        pay_status?: string;
        order_no?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        list: Order[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    ship(id: number, dto: {
        express_company: string;
        express_no: string;
    }): Promise<{
        success: boolean;
    }>;
    refund(id: number): Promise<{
        success: boolean;
    }>;
    private generateOrderNo;
}
