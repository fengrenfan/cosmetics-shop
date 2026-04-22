import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';
export declare class DashboardService {
    private readonly orderRepository;
    private readonly productRepository;
    private readonly userRepository;
    constructor(orderRepository: Repository<Order>, productRepository: Repository<Product>, userRepository: Repository<User>);
    getStats(): Promise<{
        today_orders: number;
        today_sales: number;
        product_count: number;
        user_count: number;
    }>;
}
