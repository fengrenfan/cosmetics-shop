import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    wxLogin(code: string): Promise<{
        token: string;
        user: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
        };
    }>;
    adminLogin(username: string, password: string): Promise<{
        token: string;
        user: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
        };
    }>;
    phoneLogin(phone: string, code: string): Promise<{
        token: string;
        user: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
        };
    }>;
    getProfile(userId: number): Promise<{
        id: number;
        nickname: string;
        avatar: string;
        phone: string;
        gender: number;
    }>;
    refreshToken(user: any): Promise<{
        token: string;
    }>;
    private generateToken;
    private getWxOpenid;
}
