"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
const user_entity_1 = require("../user/user.entity");
const coupon_service_1 = require("../coupon/coupon.service");
let AuthService = class AuthService {
    constructor(userRepository, jwtService, couponService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.couponService = couponService;
    }
    async wxLogin(code) {
        const openid = await this.getWxOpenid(code);
        let user = await this.userRepository.findOne({ where: { openid } });
        if (!user) {
            user = this.userRepository.create({
                openid,
                nickname: `用户${Date.now().toString().slice(-6)}`,
                status: 1,
            });
            await this.userRepository.save(user);
            await this.couponService.autoGrant(user.id, 1);
        }
        const token = this.generateToken(user);
        return {
            token,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatar: user.avatar,
                phone: user.phone,
            },
        };
    }
    async adminLogin(username, password) {
        if (username === 'admin' && password === 'admin123') {
            let user = await this.userRepository.findOne({ where: { phone: 'admin' } });
            if (!user) {
                const passwordHash = await bcrypt.hash('admin123', 10);
                user = this.userRepository.create({
                    nickname: '管理员',
                    phone: 'admin',
                    password_hash: passwordHash,
                    status: 1,
                });
                await this.userRepository.save(user);
            }
            const token = this.generateToken(user);
            return {
                token,
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    avatar: user.avatar,
                    phone: user.phone,
                },
            };
        }
        const user = await this.userRepository.findOne({
            where: { phone: username }
        });
        if (!user || !user.password_hash) {
            throw new common_1.UnauthorizedException('账号或密码错误');
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('账号或密码错误');
        }
        if (user.status === 0) {
            throw new common_1.UnauthorizedException('账号已被禁用');
        }
        user.last_login_at = new Date();
        await this.userRepository.save(user);
        const token = this.generateToken(user);
        return {
            token,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatar: user.avatar,
                phone: user.phone,
            },
        };
    }
    async phoneLogin(phone, code) {
        if (code !== '1234') {
            throw new common_1.UnauthorizedException('验证码错误');
        }
        let user = await this.userRepository.findOne({ where: { phone } });
        if (!user) {
            user = this.userRepository.create({
                phone,
                nickname: `用户${phone.slice(-4)}`,
                status: 1,
            });
            await this.userRepository.save(user);
            await this.couponService.autoGrant(user.id, 1);
        }
        if (user.status === 0) {
            throw new common_1.UnauthorizedException('账号已被禁用');
        }
        user.last_login_at = new Date();
        await this.userRepository.save(user);
        const token = this.generateToken(user);
        return {
            token,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatar: user.avatar,
                phone: user.phone,
            },
        };
    }
    async getProfile(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        return {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
            phone: user.phone,
            gender: user.gender,
        };
    }
    async refreshToken(user) {
        const userEntity = await this.userRepository.findOne({ where: { id: user.id } });
        if (!userEntity) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        return { token: this.generateToken(userEntity) };
    }
    generateToken(user) {
        return this.jwtService.sign({
            id: user.id,
            openid: user.openid,
            phone: user.phone,
        });
    }
    async getWxOpenid(code) {
        const appid = process.env.WX_APPID;
        const secret = process.env.WX_SECRET;
        if (!appid || !secret) {
            return `mock_openid_${code}`;
        }
        try {
            const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
            const response = await axios_1.default.get(url);
            if (response.data.errcode) {
                throw new Error(response.data.errmsg);
            }
            return response.data.openid;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('微信登录失败');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        coupon_service_1.CouponService])
], AuthService);
//# sourceMappingURL=auth.service.js.map