import { OrderService } from './order.service';
import { CreateOrderDto } from './order.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(dto: CreateOrderDto): Promise<{
        id: number;
        order_no: string;
        pay_amount: number;
    }>;
    getList(query: any): Promise<{
        list: import("./order.entity").Order[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDetail(id: string): Promise<import("./order.entity").Order>;
    cancel(id: string, reason: string): Promise<{
        success: boolean;
    }>;
    confirm(id: string): Promise<{
        success: boolean;
    }>;
    getCount(req: any): Promise<any>;
    getAdminList(query: any): Promise<{
        list: import("./order.entity").Order[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    ship(id: string, dto: {
        express_company: string;
        express_no: string;
    }): Promise<{
        success: boolean;
    }>;
    refund(id: string): Promise<{
        success: boolean;
    }>;
}
