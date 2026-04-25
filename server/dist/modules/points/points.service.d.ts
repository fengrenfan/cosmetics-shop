import { Repository } from 'typeorm';
import { PointLog } from './points.entity';
import { User } from '../user/user.entity';
export declare class PointsService {
    private readonly pointLogRepository;
    private readonly userRepository;
    constructor(pointLogRepository: Repository<PointLog>, userRepository: Repository<User>);
    private readonly POINTS_PER_ORDER;
    private readonly POINTS_PER_10YUAN;
    private readonly EXPIRE_MONTHS;
    getPoints(userId: number): Promise<{
        points: number;
    }>;
    getLogs(userId: number, page?: number, pageSize?: number): Promise<{
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
    calculateDeduction(userId: number, totalAmount: number, usePoints?: number): Promise<{
        canUsePoints: number;
        canUseMoney: number;
        maxPoints: number;
    }>;
    addPoints(userId: number, points: number, orderId?: number, remark?: string): Promise<{
        points: number;
    }>;
    deductPoints(userId: number, points: number, orderId: number): Promise<{
        points: number;
    }>;
    calculateOrderPoints(payAmount: number): number;
}
