import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { ProductService } from '../product/product.service';
import { AddressService } from '../address/address.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './order.dto';
export declare class OrderService {
    private readonly orderRepository;
    private readonly orderItemRepository;
    private readonly productService;
    private readonly addressService;
    private readonly cartService;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, productService: ProductService, addressService: AddressService, cartService: CartService);
    create(dto: CreateOrderDto): Promise<{
        id: number;
        order_no: string;
        pay_amount: number;
    }>;
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
    getCount(userId: number): Promise<any>;
    getAdminList(query: {
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
