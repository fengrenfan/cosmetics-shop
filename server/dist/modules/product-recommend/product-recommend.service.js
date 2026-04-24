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
exports.ProductRecommendService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_recommend_entity_1 = require("./product-recommend.entity");
const product_entity_1 = require("../product/product.entity");
const product_sku_entity_1 = require("../product/product-sku.entity");
let ProductRecommendService = class ProductRecommendService {
    constructor(recommendRepository, productRepository, skuRepository) {
        this.recommendRepository = recommendRepository;
        this.productRepository = productRepository;
        this.skuRepository = skuRepository;
    }
    async getRecommendProducts(type = 'home') {
        return this.recommendRepository.find({
            where: { status: 1, recommend_type: type },
            order: { sort_order: 'ASC', created_at: 'DESC' },
        });
    }
    async getRecommendProductsWithDetail(type = 'home') {
        const recommends = await this.recommendRepository.find({
            where: { status: 1, recommend_type: type },
            order: { sort_order: 'ASC', created_at: 'DESC' },
        });
        if (!recommends.length) {
            return { list: [], total: 0 };
        }
        const productIds = recommends.map(r => r.product_id);
        const products = await this.productRepository
            .createQueryBuilder('product')
            .where('product.id IN (:...ids)', { ids: productIds })
            .andWhere('product.status = :status', { status: 1 })
            .getMany();
        for (const product of products) {
            product.skus = await this.skuRepository.find({
                where: { product_id: product.id, status: 1 },
            });
            if (product.images) {
                try {
                    product.images = JSON.parse(product.images);
                }
                catch {
                    product.images = [];
                }
            }
        }
        const productMap = new Map(products.map(p => [p.id, p]));
        const list = productIds.map(id => productMap.get(id)).filter(Boolean);
        return { list, total: list.length };
    }
    async getHotProductsWithDetail() {
        const result = await this.getRecommendProductsWithDetail('hot');
        return result.list;
    }
    async getAllList() {
        return this.recommendRepository.find({
            order: { sort_order: 'ASC', created_at: 'DESC' },
        });
    }
    async getListByType(type) {
        return this.recommendRepository.find({
            where: { recommend_type: type },
            order: { sort_order: 'ASC', created_at: 'DESC' },
        });
    }
    async create(dto) {
        const recommend = this.recommendRepository.create({
            product_id: dto.product_id,
            recommend_type: dto.recommend_type || 'home',
            sort_order: dto.sort_order || 0,
            status: 1,
        });
        return this.recommendRepository.save(recommend);
    }
    async update(id, dto) {
        const recommend = await this.recommendRepository.findOne({ where: { id } });
        if (!recommend) {
            throw new common_1.NotFoundException('推荐不存在');
        }
        if (dto.sort_order !== undefined)
            recommend.sort_order = dto.sort_order;
        if (dto.status !== undefined)
            recommend.status = dto.status;
        return this.recommendRepository.save(recommend);
    }
    async delete(id) {
        const recommend = await this.recommendRepository.findOne({ where: { id } });
        if (!recommend) {
            throw new common_1.NotFoundException('推荐不存在');
        }
        await this.recommendRepository.delete(id);
        return { success: true };
    }
};
exports.ProductRecommendService = ProductRecommendService;
exports.ProductRecommendService = ProductRecommendService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_recommend_entity_1.ProductRecommend)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(product_sku_entity_1.ProductSku)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductRecommendService);
//# sourceMappingURL=product-recommend.service.js.map