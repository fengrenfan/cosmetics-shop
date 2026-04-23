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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("./cart.entity");
const product_entity_1 = require("../product/product.entity");
let CartService = class CartService {
    constructor(cartRepository, productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }
    async getList(userId, deviceId) {
        const where = {};
        if (userId) {
            where.user_id = userId;
        }
        else if (deviceId) {
            where.device_id = deviceId;
        }
        else {
            return [];
        }
        const carts = await this.cartRepository.find({
            where,
            relations: ['product', 'sku'],
            order: { created_at: 'DESC' },
        });
        return carts.map((cart) => ({
            id: cart.id,
            product_id: cart.product_id,
            sku_id: cart.sku_id,
            title: cart.product?.title,
            cover_image: cart.product?.cover_image,
            price: cart.sku?.price || cart.product?.price,
            stock: cart.sku?.stock || cart.product?.stock,
            sku_name: cart.sku?.sku_name,
            quantity: cart.quantity,
            is_checked: cart.is_checked,
        }));
    }
    async add(dto) {
        const { user_id, device_id, product_id, sku_id, quantity = 1 } = dto;
        if (!user_id && !device_id) {
            throw new common_1.BadRequestException('无法识别用户身份');
        }
        const product = await this.productRepository.findOne({
            where: { id: product_id },
            relations: ['skus'],
        });
        if (!product) {
            throw new common_1.NotFoundException('商品不存在');
        }
        if (product.status === 0) {
            throw new common_1.BadRequestException('商品已下架');
        }
        let price = product.price;
        let stock = product.stock;
        if (sku_id) {
            const sku = product.skus?.find((s) => s.id === sku_id);
            if (!sku) {
                throw new common_1.BadRequestException('SKU不存在');
            }
            price = sku.price;
            stock = sku.stock;
        }
        if (stock < quantity) {
            throw new common_1.BadRequestException('库存不足');
        }
        const existWhere = { product_id, sku_id: sku_id || 0 };
        if (user_id) {
            existWhere.user_id = user_id;
        }
        else {
            existWhere.device_id = device_id;
        }
        const existCart = await this.cartRepository.findOne({ where: existWhere });
        if (existCart) {
            const newQuantity = existCart.quantity + quantity;
            if (newQuantity > stock) {
                throw new common_1.BadRequestException('库存不足');
            }
            existCart.quantity = newQuantity;
            await this.cartRepository.save(existCart);
            return { id: existCart.id, quantity: newQuantity };
        }
        const cart = this.cartRepository.create({
            user_id: user_id || null,
            device_id: device_id || null,
            product_id,
            sku_id: sku_id || null,
            quantity,
            is_checked: 1,
        });
        const result = await this.cartRepository.save(cart);
        return { id: result.id, quantity };
    }
    async update(id, dto) {
        const cart = await this.cartRepository.findOne({
            where: { id },
            relations: ['product', 'sku'],
        });
        if (!cart) {
            throw new common_1.NotFoundException('购物车商品不存在');
        }
        if (dto.quantity !== undefined) {
            if (dto.quantity === 0) {
                await this.cartRepository.delete(id);
                return { success: true };
            }
            const stock = cart.sku?.stock || cart.product?.stock;
            if (dto.quantity > stock) {
                throw new common_1.BadRequestException('库存不足');
            }
            cart.quantity = dto.quantity;
        }
        await this.cartRepository.save(cart);
        return { success: true };
    }
    async remove(id) {
        await this.cartRepository.delete(id);
        return { success: true };
    }
    async batchRemove(ids) {
        await this.cartRepository.delete(ids);
        return { success: true };
    }
    async updateChecked(ids, checked, userId, deviceId) {
        if (ids && ids.length > 0) {
            const where = { id: ids.map(id => +id) };
            if (userId) {
                where.user_id = userId;
            }
            else if (deviceId) {
                where.device_id = deviceId;
            }
            await this.cartRepository
                .createQueryBuilder()
                .update(cart_entity_1.Cart)
                .set({ is_checked: checked })
                .whereInIds(ids)
                .execute();
        }
        return { success: true };
    }
    async getRecommend(userId, deviceId, limit = 50) {
        const qb = this.cartRepository.createQueryBuilder('cart')
            .leftJoinAndSelect('cart.product', 'product')
            .leftJoinAndSelect('product.category', 'category');
        if (userId) {
            qb.where('cart.user_id = :userId', { userId });
        }
        else if (deviceId) {
            qb.where('cart.device_id = :deviceId', { deviceId });
        }
        else {
            return this.getHotProducts(limit);
        }
        const carts = await qb.getMany();
        if (carts.length === 0) {
            return this.getHotProducts(limit);
        }
        const categoryIds = [...new Set(carts
                .map(cart => cart.product?.category?.parent_id || cart.product?.category_id)
                .filter(id => id))];
        const cartProductIds = carts.map(c => c.product_id);
        const productQb = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.status = :status', { status: 1 })
            .andWhere('product.id NOT IN (:...cartProductIds)', { cartProductIds });
        if (categoryIds.length > 0) {
            productQb.andWhere('(product.category_id IN (:...categoryIds) OR product.category_id IN (SELECT id FROM category WHERE parent_id IN (:...categoryIds)))', { categoryIds });
        }
        productQb.orderBy('product.sales_count', 'DESC').take(limit);
        const products = await productQb.getMany();
        for (const product of products) {
            if (product.images) {
                try {
                    product.images = JSON.parse(product.images);
                }
                catch {
                    product.images = [];
                }
            }
        }
        return products;
    }
    async getHotProducts(limit = 50) {
        const products = await this.productRepository.find({
            where: { status: 1 },
            order: { sales_count: 'DESC' },
            take: limit,
            relations: ['category'],
        });
        for (const product of products) {
            if (product.images) {
                try {
                    product.images = JSON.parse(product.images);
                }
                catch {
                    product.images = [];
                }
            }
        }
        return products;
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map