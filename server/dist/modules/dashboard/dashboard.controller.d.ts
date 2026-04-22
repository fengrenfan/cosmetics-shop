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
}
