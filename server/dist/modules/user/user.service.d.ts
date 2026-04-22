import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    getProfile(userId: number): Promise<{
        id: number;
        nickname: string;
        avatar: string;
        phone: string;
        gender: number;
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
