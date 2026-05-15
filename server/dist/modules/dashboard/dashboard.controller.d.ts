import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
        today_orders: number;
        today_sales: number;
        product_count: number;
        user_count: number;
    }>;
    getSalesTrend(days?: string): Promise<any[]>;
    getProductRanking(limit?: string): Promise<{
        name: any;
        sales: number;
        amount: number;
    }[]>;
    getLatestOrders(limit?: string): Promise<{
        id: any;
        order_no: any;
        user: any;
        amount: any;
        status: any;
        created_at: any;
    }[]>;
}
