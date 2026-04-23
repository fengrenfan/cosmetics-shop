import { Repository } from 'typeorm';
import { User } from './user.entity';
import { FavoriteService } from '../favorite/favorite.service';
import { CouponService } from '../coupon/coupon.service';
import { OrderService } from '../order/order.service';
export declare class UserService {
    private readonly userRepository;
    private readonly favoriteService;
    private readonly couponService;
    private readonly orderService;
    constructor(userRepository: Repository<User>, favoriteService: FavoriteService, couponService: CouponService, orderService: OrderService);
    getProfile(userId: number): Promise<{
        id: number;
        nickname: string;
        avatar: string;
        phone: string;
        gender: number;
    }>;
    getStats(userId: number): Promise<{
        favorite_count: number;
        coupon_count: number;
        order_count: {
            pending: number;
            paid: number;
            shipped: number;
            completed: number;
        };
    }>;
    updateProfile(userId: number, dto: any): Promise<{
        success: boolean;
    }>;
    getAdminList(page?: number, pageSize?: number): Promise<{
        list: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
            status: number;
            created_at: Date;
            last_login_at: Date;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
}
