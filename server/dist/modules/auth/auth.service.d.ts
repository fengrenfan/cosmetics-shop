import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { TaskService } from '../task/task.service';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly taskService;
    constructor(userService: UserService, jwtService: JwtService, taskService: TaskService);
    wxLogin(code: string, inviterId?: number): Promise<{
        token: string;
        user: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
            points: number;
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
    phoneLogin(phone: string, code: string, inviterId?: number): Promise<{
        token: string;
        user: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
            points: number;
        };
    }>;
    getProfile(userId: number): Promise<{
        id: number;
        nickname: string;
        avatar: string;
        phone: string;
        gender: number;
        points: number;
    }>;
    refreshToken(user: any): Promise<{
        token: string;
    }>;
    private generateToken;
    private getWxOpenid;
}
