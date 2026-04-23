import { UserService } from './user.service';
import { UpdateProfileDto } from './user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<{
        id: number;
        nickname: string;
        avatar: string;
        phone: string;
        gender: number;
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        success: boolean;
    }>;
    getStats(req: any): Promise<{
        favorite_count: number;
        coupon_count: number;
        order_count: {
            pending: number;
            paid: number;
            shipped: number;
            completed: number;
        };
    }>;
    getAdminList(page: number, pageSize: number): Promise<{
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
