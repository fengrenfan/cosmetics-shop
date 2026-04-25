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
exports.BrowseHistoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const browse_history_entity_1 = require("./browse-history.entity");
let BrowseHistoryService = class BrowseHistoryService {
    constructor(browseHistoryRepository) {
        this.browseHistoryRepository = browseHistoryRepository;
    }
    async addOrUpdate(userId, productId) {
        const existing = await this.browseHistoryRepository.findOne({
            where: { user_id: userId, product_id: productId },
        });
        if (existing) {
            existing.viewed_at = new Date();
            await this.browseHistoryRepository.save(existing);
        }
        else {
            const record = this.browseHistoryRepository.create({
                user_id: userId,
                product_id: productId,
                viewed_at: new Date(),
            });
            await this.browseHistoryRepository.save(record);
        }
    }
    async getList(userId, page = 1, pageSize = 20) {
        const qb = this.browseHistoryRepository
            .createQueryBuilder('bh')
            .leftJoinAndSelect('bh.product', 'product')
            .where('bh.user_id = :userId', { userId })
            .orderBy('bh.viewed_at', 'DESC');
        const total = await qb.getCount();
        const list = await qb
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getMany();
        return {
            list,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async clear(userId) {
        await this.browseHistoryRepository.delete({ user_id: userId });
    }
    async delete(userId, productId) {
        await this.browseHistoryRepository.delete({
            user_id: userId,
            product_id: productId,
        });
    }
};
exports.BrowseHistoryService = BrowseHistoryService;
exports.BrowseHistoryService = BrowseHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(browse_history_entity_1.BrowseHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BrowseHistoryService);
//# sourceMappingURL=browse-history.service.js.map