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
    getAdminList(page: number, pageSize: number, id?: string, phone?: string, status?: string): Promise<{
        list: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
            gender: number;
            openid: string;
            status: number;
            points: number;
            created_at: Date;
            last_login_at: Date;
            last_login_ip: string;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    search(phone: string): Promise<{
        data: {
            id: number;
            nickname: string;
            phone: string;
            avatar: string;
        };
    }>;
    getAdminDetail(id: number): Promise<{
        id: number;
        nickname: string;
        avatar: string;
        phone: string;
        gender: number;
        openid: string;
        unionid: string;
        status: number;
        points: number;
        created_at: Date;
        last_login_at: Date;
        last_login_ip: string;
    }>;
    toggleStatus(id: number, status: number): Promise<{
        success: boolean;
    }>;
}
