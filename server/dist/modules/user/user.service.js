"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getProfile(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            return null;
        return {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
            phone: user.phone,
            gender: user.gender,
        };
    }
    async updateProfile(userId, dto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            return null;
        if (dto.nickname !== undefined)
            user.nickname = dto.nickname;
        if (dto.avatar !== undefined)
            user.avatar = dto.avatar;
        if (dto.gender !== undefined)
            user.gender = dto.gender;
        if (dto.phone !== undefined)
            user.phone = dto.phone;
        await this.userRepository.save(user);
        return { success: true };
    }
    async getAdminList(page = 1, pageSize = 20) {
        const [list, total] = await this.userRepository.findAndCount({
            order: { created_at: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return {
            list: list.map((u) => ({
                id: u.id,
                nickname: u.nickname,
                avatar: u.avatar,
                phone: u.phone,
                status: u.status,
                created_at: u.created_at,
                last_login_at: u.last_login_at,
            })),
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map