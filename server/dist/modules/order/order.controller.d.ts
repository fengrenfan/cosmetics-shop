import type { Response } from 'express';
import { OrderService } from './order.service';
import { CreateOrderDto } from './order.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(req: any, dto: CreateOrderDto): Promise<{
        id: number;
        order_no: string;
        pay_amount: number;
        pay_status: string;
    }>;
    getList(req: any, query: any): Promise<{
        list: import("./order.entity").Order[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCount(req: any): Promise<{
        pending: number;
        paid: number;
        shipped: number;
        completed: number;
    }>;
    getDetail(id: string): Promise<import("./order.entity").Order>;
    cancel(id: string, reason: string): Promise<{
        success: boolean;
    }>;
    confirm(id: string): Promise<{
        success: boolean;
    }>;
    mockCreate(req: any): Promise<{
        id: any;
        order_no: string;
        pay_amount: number;
        pay_status: string;
    }>;
    getAdminList(query: any): Promise<{
        list: import("./order.entity").Order[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    exportOrders(query: Record<string, string>, res: Response): Promise<void>;
    ship(id: string, dto: {
        express_company: string;
        express_no: string;
    }): Promise<{
        success: boolean;
    }>;
    refund(id: string): Promise<{
        success: boolean;
    }>;
    getTracking(id: string): Promise<{
        status: string;
        express_company: any;
        express_no: any;
        state: string;
        traces: {
            time: any;
            description: string;
        }[];
    } | {
        status: string;
        express_company: string;
        express_no: string;
        state: any;
        traces: any;
        message?: undefined;
    } | {
        status: string;
        message: any;
        traces: any[];
        express_company?: undefined;
        express_no?: undefined;
        state?: undefined;
    }>;
}
