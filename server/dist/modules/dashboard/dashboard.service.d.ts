import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';
export declare class DashboardService {
    private readonly orderRepository;
    private readonly orderItemRepository;
    private readonly productRepository;
    private readonly userRepository;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, productRepository: Repository<Product>, userRepository: Repository<User>);
    getStats(): Promise<{
        today_orders: number;
        today_sales: number;
        product_count: number;
        user_count: number;
    }>;
    getSalesTrend(days?: number): Promise<any[]>;
    getProductRanking(limit?: number): Promise<{
        name: any;
        sales: number;
        amount: number;
    }[]>;
    getLatestOrders(limit?: number): Promise<{
        id: any;
        order_no: any;
        user: any;
        amount: any;
        status: any;
        created_at: any;
    }[]>;
}
