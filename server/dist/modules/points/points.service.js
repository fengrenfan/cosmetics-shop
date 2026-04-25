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
exports.PointsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const points_entity_1 = require("./points.entity");
const user_entity_1 = require("../user/user.entity");
let PointsService = class PointsService {
    constructor(pointLogRepository, userRepository) {
        this.pointLogRepository = pointLogRepository;
        this.userRepository = userRepository;
        this.POINTS_PER_ORDER = 10;
        this.POINTS_PER_10YUAN = 1;
        this.EXPIRE_MONTHS = 12;
    }
    async getPoints(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        return { points: user?.points || 0 };
    }
    async getLogs(userId, page = 1, pageSize = 20) {
        const [list, total] = await this.pointLogRepository.findAndCount({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return {
            list: list.map(log => ({
                id: log.id,
                type: log.type,
                points: log.points,
                balance: log.balance,
                source: log.source,
                remark: log.remark,
                created_at: log.created_at,
            })),
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        };
    }
    async calculateDeduction(userId, totalAmount, usePoints) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const availablePoints = user?.points || 0;
        if (availablePoints < 500) {
            return { canUsePoints: 0, canUseMoney: 0, maxPoints: 0 };
        }
        const maxMoney = Math.floor(availablePoints / 100);
        const maxDeductMoney = Math.min(maxMoney, totalAmount);
        const maxPoints = maxDeductMoney * 100;
        if (usePoints !== undefined) {
            if (usePoints > maxPoints) {
                usePoints = maxPoints;
            }
            usePoints = Math.floor(usePoints / 100) * 100;
            const deductMoney = usePoints / 100;
            return { canUsePoints: usePoints, canUseMoney: deductMoney, maxPoints };
        }
        return { canUsePoints: 0, canUseMoney: 0, maxPoints };
    }
    async addPoints(userId, points, orderId, remark) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('用户不存在');
        const expiredAt = new Date();
        expiredAt.setMonth(expiredAt.getMonth() + this.EXPIRE_MONTHS);
        user.points = (user.points || 0) + points;
        await this.userRepository.save(user);
        const log = this.pointLogRepository.create({
            user_id: userId,
            type: 1,
            points,
            balance: user.points,
            source: 'order',
            order_id: orderId,
            remark: remark || `订单返积分`,
            expired_at: expiredAt,
        });
        await this.pointLogRepository.save(log);
        return { points: user.points };
    }
    async deductPoints(userId, points, orderId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('用户不存在');
        if ((user.points || 0) < points)
            throw new common_1.BadRequestException('积分不足');
        const availableLogs = await this.pointLogRepository.find({
            where: {
                user_id: userId,
                type: 1,
            },
            order: { expired_at: 'ASC' },
        });
        const initialBalance = user.points;
        let remainingPoints = points;
        let totalDeductedFromLogs = 0;
        for (const log of availableLogs) {
            if (remainingPoints <= 0)
                break;
            if (log.expired_at && new Date(log.expired_at) < new Date())
                continue;
            const availableInLog = (log.points || 0) - (log.deducted_points || 0);
            if (availableInLog <= 0)
                continue;
            const deductFromThis = Math.min(availableInLog, remainingPoints);
            if (deductFromThis > 0) {
                const deductLog = this.pointLogRepository.create({
                    user_id: userId,
                    type: 2,
                    points: deductFromThis,
                    balance: initialBalance - totalDeductedFromLogs - deductFromThis,
                    source: 'exchange',
                    order_id: orderId,
                    remark: '积分兑换',
                });
                await this.pointLogRepository.save(deductLog);
                log.deducted_points = (log.deducted_points || 0) + deductFromThis;
                if (log.deducted_points >= log.points) {
                    log.deducted_at = new Date();
                }
                await this.pointLogRepository.save(log);
                remainingPoints -= deductFromThis;
                totalDeductedFromLogs += deductFromThis;
            }
        }
        user.points = (user.points || 0) - points;
        await this.userRepository.save(user);
        return { points: user.points };
    }
    calculateOrderPoints(payAmount) {
        const fixedPoints = this.POINTS_PER_ORDER;
        const spendPoints = Math.floor(payAmount / 10) * this.POINTS_PER_10YUAN;
        return fixedPoints + spendPoints;
    }
};
exports.PointsService = PointsService;
exports.PointsService = PointsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(points_entity_1.PointLog)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PointsService);
//# sourceMappingURL=points.service.js.map