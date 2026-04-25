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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./order.entity");
const order_item_entity_1 = require("./order-item.entity");
const product_service_1 = require("../product/product.service");
const address_service_1 = require("../address/address.service");
const cart_service_1 = require("../cart/cart.service");
const points_service_1 = require("../points/points.service");
const coupon_service_1 = require("../coupon/coupon.service");
const coupon_entity_1 = require("../coupon/coupon.entity");
const coupon_constants_1 = require("../coupon/coupon.constants");
let OrderService = class OrderService {
    constructor(orderRepository, orderItemRepository, userCouponRepository, productService, addressService, cartService, pointsService, couponService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userCouponRepository = userCouponRepository;
        this.productService = productService;
        this.addressService = addressService;
        this.cartService = cartService;
        this.pointsService = pointsService;
        this.couponService = couponService;
    }
    async create(dto) {
        const { user_id, address_id, items, remark, coupon_id, points_amount, points_money } = dto;
        const address = await this.addressService.getById(address_id, user_id);
        if (!address) {
            throw new common_1.NotFoundException('收货地址不存在');
        }
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await this.productService.getDetail(item.product_id);
            if (!product) {
                throw new common_1.NotFoundException(`商品[${item.product_id}]不存在`);
            }
            if (product.status === 0) {
                throw new common_1.BadRequestException(`商品[${product.title}]已下架`);
            }
            let price = product.price;
            let skuName = '';
            if (item.sku_id) {
                const sku = product.skus?.find((s) => s.id === item.sku_id);
                if (!sku) {
                    throw new common_1.BadRequestException('SKU不存在');
                }
                price = sku.price;
                skuName = sku.sku_name;
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`商品[${product.title}]库存不足`);
            }
            const subtotal = price * item.quantity;
            totalAmount += subtotal;
            orderItems.push({
                product_id: item.product_id,
                sku_id: item.sku_id || null,
                product_title: product.title,
                sku_name: skuName,
                cover_image: product.cover_image,
                price,
                quantity: item.quantity,
                subtotal,
            });
            await this.productService.decrementStock(item.product_id, item.sku_id, item.quantity);
        }
        const freightAmount = totalAmount >= 99 ? 0 : 10;
        let discountAmount = 0;
        let userCouponId = null;
        if (coupon_id) {
            const validation = await this.couponService.validateForOrder(user_id, coupon_id, totalAmount);
            if (!validation.valid) {
                throw new common_1.BadRequestException(validation.error);
            }
            const discount = await this.couponService.applyToOrder(coupon_id, totalAmount);
            discountAmount = discount.discountAmount;
            const userCoupon = await this.userCouponRepository.findOne({
                where: { user_id, coupon_id, status: coupon_constants_1.USER_COUPON_STATUS.UNUSED },
            });
            userCouponId = userCoupon?.id;
        }
        const pointsMoney = points_money || 0;
        const payAmount = totalAmount + freightAmount - discountAmount - pointsMoney;
        const orderNo = this.generateOrderNo();
        const order = this.orderRepository.create({
            order_no: orderNo,
            user_id,
            total_amount: totalAmount,
            freight_amount: freightAmount,
            coupon_amount: discountAmount,
            coupon_id: coupon_id || null,
            pay_amount: payAmount,
            status: 'pending',
            address_snapshot: {
                name: address.name,
                phone: address.phone,
                province: address.province,
                city: address.city,
                district: address.district,
                detail_address: address.detail_address,
            },
            remark,
        });
        const savedOrder = await this.orderRepository.save(order);
        if (userCouponId) {
            await this.couponService.markAsUsed(userCouponId, savedOrder.id);
        }
        if (points_amount && points_amount > 0) {
            try {
                await this.pointsService.deductPoints(user_id, points_amount, savedOrder.id);
                savedOrder.points_amount = points_amount;
                savedOrder.points_money = pointsMoney;
                await this.orderRepository.save(savedOrder);
            }
            catch (e) {
                throw new common_1.BadRequestException('积分扣减失败：' + e.message);
            }
        }
        for (const item of orderItems) {
            const orderItem = this.orderItemRepository.create({
                ...item,
                order_id: savedOrder.id,
            });
            await this.orderItemRepository.save(orderItem);
        }
        for (const item of items) {
            if (item.cart_id) {
                await this.cartService.remove(item.cart_id);
            }
        }
        return {
            id: savedOrder.id,
            order_no: orderNo,
            pay_amount: payAmount,
        };
    }
    async getList(query) {
        const { user_id, status, page = 1, pageSize = 10 } = query;
        const qb = this.orderRepository
            .createQueryBuilder('order')
            .where('order.user_id = :user_id', { user_id });
        if (status) {
            qb.andWhere('order.status = :status', { status });
        }
        const total = await qb.getCount();
        const list = await qb
            .orderBy('order.created_at', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getMany();
        for (const order of list) {
            order.items = await this.orderItemRepository.find({
                where: { order_id: order.id },
            });
        }
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
    async getDetail(id) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        order.items = await this.orderItemRepository.find({
            where: { order_id: id },
        });
        return order;
    }
    async cancel(id, reason) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (!['pending'].includes(order.status)) {
            throw new common_1.BadRequestException('当前状态不允许取消');
        }
        order.status = 'cancelled';
        order.cancel_time = new Date();
        order.cancel_reason = reason || '用户取消';
        await this.orderRepository.save(order);
        const items = await this.orderItemRepository.find({ where: { order_id: id } });
        for (const item of items) {
            await this.productService.incrementStock(item.product_id, item.sku_id, item.quantity);
        }
        if (order.points_amount && order.points_amount > 0) {
            await this.pointsService.addPoints(order.user_id, order.points_amount, order.id, `订单取消返还积分`);
        }
        return { success: true };
    }
    async confirm(id) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.status !== 'shipped') {
            throw new common_1.BadRequestException('当前状态不允许确认收货');
        }
        order.status = 'completed';
        order.complete_time = new Date();
        await this.orderRepository.save(order);
        const points = this.pointsService.calculateOrderPoints(order.pay_amount);
        await this.pointsService.addPoints(order.user_id, points, order.id, `订单 ${order.order_no} 完成返积分`);
        return { success: true };
    }
    async getCount(userId) {
        const pendingCount = await this.orderRepository.count({ where: { user_id: userId, status: 'pending' } });
        const paidCount = await this.orderRepository.count({ where: { user_id: userId, status: 'paid' } });
        const shippedCount = await this.orderRepository.count({ where: { user_id: userId, status: 'shipped' } });
        const completedCount = await this.orderRepository.count({ where: { user_id: userId, status: 'completed' } });
        return {
            pending: pendingCount,
            paid: paidCount,
            shipped: shippedCount,
            completed: completedCount,
        };
    }
    async getAdminList(query) {
        const { status, page = 1, pageSize = 10 } = query;
        const qb = this.orderRepository.createQueryBuilder('order');
        if (status) {
            qb.andWhere('order.status = :status', { status });
        }
        const total = await qb.getCount();
        const list = await qb
            .orderBy('order.created_at', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getMany();
        for (const order of list) {
            order.items = await this.orderItemRepository.find({
                where: { order_id: order.id },
            });
        }
        return {
            list,
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        };
    }
    async ship(id, dto) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.status !== 'paid') {
            throw new common_1.BadRequestException('当前状态不允许发货');
        }
        order.status = 'shipped';
        order.ship_time = new Date();
        order.express_company = dto.express_company;
        order.express_no = dto.express_no;
        await this.orderRepository.save(order);
        return { success: true };
    }
    async refund(id) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (!['paid', 'shipped'].includes(order.status)) {
            throw new common_1.BadRequestException('当前状态不允许退款');
        }
        order.status = 'refunded';
        await this.orderRepository.save(order);
        const items = await this.orderItemRepository.find({ where: { order_id: id } });
        for (const item of items) {
            await this.productService.incrementStock(item.product_id, item.sku_id, item.quantity);
        }
        if (order.points_amount && order.points_amount > 0) {
            await this.pointsService.addPoints(order.user_id, order.points_amount, order.id, `订单退款返还积分`);
        }
        return { success: true };
    }
    generateOrderNo() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `COS${year}${month}${day}${random}`;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(coupon_entity_1.UserCoupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        product_service_1.ProductService,
        address_service_1.AddressService,
        cart_service_1.CartService,
        points_service_1.PointsService,
        coupon_service_1.CouponService])
], OrderService);
//# sourceMappingURL=order.service.js.map