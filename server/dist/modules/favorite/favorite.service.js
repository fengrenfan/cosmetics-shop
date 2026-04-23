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
exports.FavoriteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const favorite_entity_1 = require("./favorite.entity");
let FavoriteService = class FavoriteService {
    constructor(favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }
    async getList(userId) {
        const favorites = await this.favoriteRepository.find({
            where: { user_id: userId },
            relations: ['product'],
            order: { created_at: 'DESC' },
        });
        return favorites
            .filter((f) => f.product)
            .map((f) => ({
            id: f.id,
            product_id: f.product_id,
            title: f.product.title,
            cover_image: f.product.cover_image,
            price: f.product.price,
            created_at: f.created_at,
        }));
    }
    async getCount(userId) {
        return this.favoriteRepository.count({ where: { user_id: userId } });
    }
    async toggle(userId, productId) {
        const exist = await this.favoriteRepository.findOne({
            where: { user_id: userId, product_id: productId },
        });
        if (exist) {
            await this.favoriteRepository.delete(exist.id);
            return { is_favorited: false };
        }
        const favorite = this.favoriteRepository.create({
            user_id: userId,
            product_id: productId,
        });
        await this.favoriteRepository.save(favorite);
        return { is_favorited: true };
    }
};
exports.FavoriteService = FavoriteService;
exports.FavoriteService = FavoriteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FavoriteService);
//# sourceMappingURL=favorite.service.js.map