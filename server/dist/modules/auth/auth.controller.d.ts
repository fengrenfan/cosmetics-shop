import { AuthService } from './auth.service';
import { WxLoginDto, AdminLoginDto, SendCodeDto, PhoneLoginDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    wxLogin(dto: WxLoginDto): Promise<{
        token: string;
        user: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
        };
    }>;
    adminLogin(dto: AdminLoginDto): Promise<{
        token: string;
        user: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
        };
    }>;
    sendCode(dto: SendCodeDto): Promise<{
        code: number;
        message: string;
        data: {
            code: string;
        };
    }>;
    phoneLogin(dto: PhoneLoginDto): Promise<{
        token: string;
        user: {
            id: number;
            nickname: string;
            avatar: string;
            phone: string;
        };
    }>;
    refresh(req: any): Promise<{
        token: string;
    }>;
    getProfile(req: any): Promise<{
        id: number;
        nickname: string;
        avatar: string;
        phone: string;
        gender: number;
    }>;
}
