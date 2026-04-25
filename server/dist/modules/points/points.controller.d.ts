import { PointsService } from './points.service';
export declare class PointsController {
    private readonly pointsService;
    constructor(pointsService: PointsService);
    getPoints(req: any): Promise<{
        points: number;
    }>;
    getLogs(req: any, page?: number, pageSize?: number): Promise<{
        list: {
            id: number;
            type: number;
            points: number;
            balance: number;
            source: string;
            remark: string;
            created_at: Date;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    calculate(req: any, body: {
        total_amount: number;
        points?: number;
    }): Promise<{
        canUsePoints: number;
        canUseMoney: number;
        maxPoints: number;
    }>;
}
