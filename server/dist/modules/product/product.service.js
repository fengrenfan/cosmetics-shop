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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
const product_sku_entity_1 = require("./product-sku.entity");
let ProductService = class ProductService {
    constructor(productRepository, skuRepository) {
        this.productRepository = productRepository;
        this.skuRepository = skuRepository;
    }
    async getList(query) {
        const { page = 1, pageSize = 10, category_id, keyword, status, sort = 'sort_order', order = 'desc', min_price, max_price, is_new, is_hot, is_recommend, in_stock } = query;
        const qb = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category');
        if (status !== undefined && status !== null) {
            qb.andWhere('product.status = :status', { status: +status });
        }
        if (category_id) {
            qb.andWhere('product.category_id = :category_id', { category_id });
        }
        if (keyword) {
            qb.andWhere('(product.title LIKE :keyword OR product.subtitle LIKE :keyword)', {
                keyword: `%${keyword}%`,
            });
        }
        if (min_price !== undefined) {
            qb.andWhere('product.price >= :min_price', { min_price });
        }
        if (max_price !== undefined) {
            qb.andWhere('product.price <= :max_price', { max_price });
        }
        if (is_new) {
            qb.andWhere('product.is_new = :is_new', { is_new: 1 });
        }
        if (is_hot) {
            qb.andWhere('product.is_hot = :is_hot', { is_hot: 1 });
        }
        if (is_recommend) {
            qb.andWhere('product.is_recommend = :is_recommend', { is_recommend: 1 });
        }
        if (in_stock) {
            qb.andWhere('product.stock > :stock', { stock: 0 });
        }
        const orderMap = {
            sort_order: 'product.sort_order',
            price: 'product.price',
            sales_count: 'product.sales_count',
            created_at: 'product.created_at',
        };
        qb.orderBy(orderMap[sort] || 'product.sort_order', order.toUpperCase());
        const total = await qb.getCount();
        const list = await qb
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getMany();
        for (const product of list) {
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
        return {
            list,
            pagination: {
                page: +page,
                pageSize: +pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    async getRecommend({ page, pageSize }) {
        const qb = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.status = :status', { status: 1 })
            .andWhere('product.is_recommend = :is_recommend', { is_recommend: 1 })
            .orderBy('product.sort_order', 'DESC');
        const total = await qb.getCount();
        const list = await qb
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getMany();
        return {
            list,
            pagination: { page, pageSize, total },
        };
    }
    async getFeatured() {
        const product = await this.productRepository.findOne({
            where: { status: 1, is_recommend: 1 },
            order: { sort_order: 'DESC', created_at: 'DESC' },
            relations: ['category'],
        });
        if (product) {
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
        return product;
    }
    async getHot(limit = 10) {
        return this.productRepository.find({
            where: { status: 1, is_hot: 1 },
            order: { sales_count: 'DESC' },
            take: limit,
        });
    }
    async getDetail(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!product) {
            throw new common_1.NotFoundException('商品不存在');
        }
        await this.productRepository.increment({ id }, 'view_count', 1);
        product.skus = await this.skuRepository.find({
            where: { product_id: id, status: 1 },
        });
        if (product.images) {
            try {
                product.images = JSON.parse(product.images);
            }
            catch {
                product.images = [];
            }
        }
        return product;
    }
    async create(dto) {
        const product = this.productRepository.create({
            category_id: dto.category_id,
            title: dto.title,
            subtitle: dto.subtitle,
            cover_image: dto.cover_image,
            images: dto.images,
            detail_html: dto.detail_html,
            price: dto.price,
            original_price: dto.original_price,
            stock: dto.stock,
            is_recommend: dto.is_recommend || 0,
            is_hot: dto.is_hot || 0,
            is_new: dto.is_new || 0,
            status: dto.status ?? 1,
            sort_order: dto.sort_order || 0,
        });
        if (product.images && Array.isArray(product.images)) {
            product.images = JSON.stringify(product.images);
        }
        const result = await this.productRepository.save(product);
        if (dto.skus && dto.skus.length > 0) {
            for (const sku of dto.skus) {
                await this.skuRepository.save(this.skuRepository.create({
                    product_id: result.id,
                    sku_name: sku.sku_name,
                    sku_attrs: typeof sku.sku_attrs === 'object' ? JSON.stringify(sku.sku_attrs) : sku.sku_attrs,
                    price: sku.price,
                    stock: sku.stock,
                    image: sku.image,
                }));
            }
        }
        return result;
    }
    async update(id, dto) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('商品不存在');
        }
        Object.assign(product, dto);
        if (product.images && Array.isArray(product.images)) {
            product.images = JSON.stringify(product.images);
        }
        await this.productRepository.save(product);
        return { success: true };
    }
    async delete(id) {
        await this.productRepository.delete(id);
        await this.skuRepository.delete({ product_id: id });
        return { success: true };
    }
    async updateStatus(id, status) {
        await this.productRepository.update(id, { status });
        return { success: true };
    }
    async decrementStock(productId, skuId, quantity) {
        if (skuId) {
            await this.skuRepository.decrement({ id: skuId }, 'stock', quantity);
        }
        else {
            await this.productRepository.decrement({ id: productId }, 'stock', quantity);
        }
    }
    async incrementStock(productId, skuId, quantity) {
        if (skuId) {
            await this.skuRepository.increment({ id: skuId }, 'stock', quantity);
        }
        else {
            await this.productRepository.increment({ id: productId }, 'stock', quantity);
        }
    }
    async batchUpdateStatus(ids, status) {
        await this.productRepository.update(ids, { status });
        return { success: true };
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_sku_entity_1.ProductSku)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductService);
//# sourceMappingURL=product.service.js.map