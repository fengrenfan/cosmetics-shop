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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = exports.ORDER_PAY_STATUS = void 0;
const axios_1 = __importDefault(require("axios"));
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
exports.ORDER_PAY_STATUS = {
    UNPAID: 'unpaid',
    PAYING: 'paying',
    PAID: 'paid',
    FAILED: 'failed',
    CLOSED: 'closed',
    REFUNDING: 'refunding',
    REFUNDED: 'refunded',
};
let OrderService = OrderService_1 = class OrderService {
    constructor(orderRepository, orderItemRepository, userCouponRepository, productService, addressService, cartService, pointsService, couponService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userCouponRepository = userCouponRepository;
        this.productService = productService;
        this.addressService = addressService;
        this.cartService = cartService;
        this.pointsService = pointsService;
        this.couponService = couponService;
        this.lastTimestamp = 0;
        this.sequence = 0;
        this.expressCodeMap = {
            '顺丰速运': 'shunfeng', '顺丰': 'shunfeng',
            '圆通快递': 'yuantong', '圆通': 'yuantong',
            '中通快递': 'zhongtong', '中通': 'zhongtong',
            '韵达快递': 'yunda', '韵达': 'yunda',
            '申通快递': 'shentong', '申通': 'shentong',
            '京东物流': 'jd', '京东': 'jd',
            '极兔速递': 'jtexpress', '极兔': 'jtexpress',
            '邮政快递包裹': 'youzhengguonei', 'EMS': 'ems',
            '德邦快递': 'debangwuliu', '德邦': 'debangwuliu',
        };
    }
    async create(dto) {
        const { user_id, address_id, items, remark, coupon_id, points_amount, points_money, pay_channel, pay_scene } = dto;
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
            pay_status: exports.ORDER_PAY_STATUS.UNPAID,
            pay_channel: pay_channel || null,
            pay_scene: pay_scene || null,
            address_snapshot: JSON.stringify({
                name: address.name,
                phone: address.phone,
                province: address.province,
                city: address.city,
                district: address.district,
                detail_address: address.detail_address,
            }),
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
            pay_status: savedOrder.pay_status,
        };
    }
    async getById(id) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        return order;
    }
    async markPaying(orderId, params) {
        const order = await this.getById(orderId);
        if (!['pending'].includes(order.status)) {
            throw new common_1.BadRequestException('当前订单状态不允许发起支付');
        }
        if (order.pay_status === exports.ORDER_PAY_STATUS.PAID) {
            return order;
        }
        order.pay_channel = params.pay_channel;
        order.pay_scene = params.pay_scene;
        order.out_trade_no = params.out_trade_no;
        order.pay_status = exports.ORDER_PAY_STATUS.PAYING;
        return this.orderRepository.save(order);
    }
    async markPaid(orderId, params) {
        const order = await this.getById(orderId);
        if (order.pay_status === exports.ORDER_PAY_STATUS.PAID && order.status === 'paid') {
            return order;
        }
        if (order.status !== 'pending') {
            throw new common_1.BadRequestException('当前订单状态不允许标记支付成功');
        }
        const now = new Date();
        order.status = 'paid';
        order.pay_status = exports.ORDER_PAY_STATUS.PAID;
        order.pay_time = now;
        order.paid_at = now;
        order.third_trade_no = params.third_trade_no || order.third_trade_no;
        order.notify_payload = params.notify_payload || order.notify_payload;
        order.notify_at = params.notify_at || now;
        order.pay_fail_reason = null;
        return this.orderRepository.save(order);
    }
    async markPayFailed(orderId, reason, notifyPayload) {
        const order = await this.getById(orderId);
        if (order.pay_status === exports.ORDER_PAY_STATUS.PAID) {
            return order;
        }
        order.pay_status = exports.ORDER_PAY_STATUS.FAILED;
        order.pay_fail_reason = reason || '支付失败';
        order.notify_payload = notifyPayload || order.notify_payload;
        order.notify_at = new Date();
        return this.orderRepository.save(order);
    }
    async markClosed(orderId, reason) {
        const order = await this.getById(orderId);
        if (order.pay_status === exports.ORDER_PAY_STATUS.PAID) {
            throw new common_1.BadRequestException('已支付订单不可关闭');
        }
        if (order.status === 'cancelled' && order.pay_status === exports.ORDER_PAY_STATUS.CLOSED) {
            return order;
        }
        order.status = 'cancelled';
        order.cancel_time = new Date();
        order.cancel_reason = reason || order.cancel_reason || '支付关闭';
        order.pay_status = exports.ORDER_PAY_STATUS.CLOSED;
        return this.orderRepository.save(order);
    }
    async markRefunded(orderId) {
        const order = await this.getById(orderId);
        order.status = 'refunded';
        order.pay_status = exports.ORDER_PAY_STATUS.REFUNDED;
        return this.orderRepository.save(order);
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
        this.parseSnapshots(list);
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
        this.parseSnapshot(order);
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
        order.pay_status = exports.ORDER_PAY_STATUS.CLOSED;
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
    buildAdminQuery(query) {
        const qb = this.orderRepository.createQueryBuilder('order');
        if (query.status) {
            qb.andWhere('order.status = :status', { status: query.status });
        }
        if (query.pay_status) {
            qb.andWhere('order.pay_status = :pay_status', { pay_status: query.pay_status });
        }
        if (query.order_no) {
            qb.andWhere('order.order_no LIKE :order_no', { order_no: `%${query.order_no}%` });
        }
        if (query.start_date) {
            qb.andWhere('order.created_at >= :start_date', { start_date: query.start_date });
        }
        if (query.end_date) {
            qb.andWhere('order.created_at < :end_date', { end_date: query.end_date + ' 23:59:59' });
        }
        return qb;
    }
    async attachItems(orders) {
        if (orders.length === 0)
            return;
        const ids = orders.map(o => o.id);
        const items = await this.orderItemRepository
            .createQueryBuilder('item')
            .where('item.order_id IN (:...ids)', { ids })
            .getMany();
        const itemsByOrder = new Map();
        for (const item of items) {
            if (!itemsByOrder.has(item.order_id)) {
                itemsByOrder.set(item.order_id, []);
            }
            itemsByOrder.get(item.order_id).push(item);
        }
        for (const order of orders) {
            order.items = itemsByOrder.get(order.id) || [];
        }
    }
    async getAdminList(query) {
        const { page = 1, pageSize = 10 } = query;
        const qb = this.buildAdminQuery(query);
        const total = await qb.getCount();
        const list = await qb
            .orderBy('order.created_at', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getMany();
        await this.attachItems(list);
        this.parseSnapshots(list);
        return {
            list,
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        };
    }
    async exportOrders(query) {
        const qb = this.buildAdminQuery(query);
        const list = await qb
            .orderBy('order.created_at', 'DESC')
            .take(5000)
            .getMany();
        await this.attachItems(list);
        return list;
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
        await this.markRefunded(order.id);
        const items = await this.orderItemRepository.find({ where: { order_id: id } });
        for (const item of items) {
            await this.productService.incrementStock(item.product_id, item.sku_id, item.quantity);
        }
        if (order.points_amount && order.points_amount > 0) {
            await this.pointsService.addPoints(order.user_id, order.points_amount, order.id, `订单退款返还积分`);
        }
        return { success: true };
    }
    async mockCreate(userId) {
        const products = await this.orderRepository.query('SELECT id, title, cover_image, price FROM product WHERE status = 1 LIMIT 1');
        const product = products?.[0];
        const price = parseFloat(product?.price) || 99;
        const freightAmount = price >= 99 ? 0 : 10;
        const payAmount = price + freightAmount;
        const orderNo = this.generateOrderNo();
        const addressSnapshot = JSON.stringify({
            name: '测试用户', phone: '13800138000',
            province: '广东省', city: '深圳市', district: '南山区',
            detail_address: '科技园 mock 地址',
        });
        await this.orderRepository.query(`INSERT INTO \`order\` (order_no, user_id, status, pay_status, total_amount, freight_amount, pay_amount, address_snapshot, remark, created_at)
       VALUES (?, ?, 'pending', 'unpaid', ?, ?, ?, ?, ?, NOW())`, [orderNo, userId, price, freightAmount, payAmount, addressSnapshot, 'mock 订单']);
        const [{ id: orderId }] = await this.orderRepository.query('SELECT id FROM `order` WHERE order_no = ?', [orderNo]);
        await this.orderItemRepository.query('INSERT INTO order_item (order_id, product_id, product_title, cover_image, price, quantity, subtotal, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, NOW())', [orderId, product?.id || 1, product?.title || '测试商品', product?.cover_image || '', price, price]);
        return { id: orderId, order_no: orderNo, pay_amount: payAmount, pay_status: 'unpaid' };
    }
    parseSnapshot(order) {
        if (typeof order.address_snapshot === 'string') {
            try {
                order.address_snapshot = JSON.parse(order.address_snapshot);
            }
            catch { }
        }
    }
    parseSnapshots(orders) {
        for (const order of orders) {
            this.parseSnapshot(order);
        }
    }
    generateOrderNo() {
        let timestamp = Date.now();
        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1) & OrderService_1.SEQUENCE_MASK;
            if (this.sequence === 0) {
                while (timestamp <= this.lastTimestamp) {
                    timestamp = Date.now();
                }
            }
        }
        else {
            this.sequence = 0;
        }
        this.lastTimestamp = timestamp;
        const snowflakeId = (BigInt(timestamp - OrderService_1.EPOCH) << BigInt(OrderService_1.TIMESTAMP_LEFT_SHIFT) |
            BigInt(OrderService_1.WORKER_ID) << BigInt(OrderService_1.WORKER_ID_SHIFT) |
            BigInt(this.sequence)).toString();
        return `COS${snowflakeId}`;
    }
    async getTracking(orderId) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order)
            throw new Error('订单不存在');
        if (!order.express_no || !order.express_company) {
            return { status: 'no_data', message: '暂无物流信息', traces: [] };
        }
        const customer = process.env.KUAIDI100_CUSTOMER;
        const key = process.env.KUAIDI100_KEY;
        if (!customer || !key) {
            return this.getMockTracking(order);
        }
        const code = this.expressCodeMap[order.express_company] || order.express_company;
        try {
            const param = JSON.stringify({ com: code, num: order.express_no });
            const sign = require('crypto')
                .createHash('md5')
                .update(param + key + customer)
                .digest('hex')
                .toUpperCase();
            const res = await axios_1.default.post('https://poll.kuaidi100.com/poll/query.do', `customer=${customer}&sign=${sign}&param=${encodeURIComponent(param)}`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 5000 });
            if (res.data?.status === '200') {
                const data = res.data;
                return {
                    status: 'ok',
                    express_company: order.express_company,
                    express_no: order.express_no,
                    state: data.state,
                    traces: (data.data || []).map((t) => ({
                        time: t.time,
                        description: t.context,
                    })),
                };
            }
            return { status: 'error', message: res.data?.message || '查询失败', traces: [] };
        }
        catch (e) {
            console.error('物流查询失败:', e.message);
            return this.getMockTracking(order);
        }
    }
    getMockTracking(order) {
        const traces = [
            { time: order.ship_time || order.created_at, description: '快件已从仓库发出' },
            { time: order.ship_time || order.created_at, description: `快件已到达${order.express_company || '快递'}转运中心` },
            { time: order.ship_time || order.created_at, description: '快件派送中，快递员正在配送' },
        ];
        return {
            status: 'mock',
            express_company: order.express_company,
            express_no: order.express_no,
            state: order.status === 'completed' ? '3' : '2',
            traces,
        };
    }
};
exports.OrderService = OrderService;
OrderService.EPOCH = 1700000000000;
OrderService.WORKER_ID = 1;
OrderService.SEQUENCE_BITS = 12;
OrderService.WORKER_ID_BITS = 10;
OrderService.TIMESTAMP_LEFT_SHIFT = 22;
OrderService.WORKER_ID_SHIFT = 12;
OrderService.SEQUENCE_MASK = 4095;
exports.OrderService = OrderService = OrderService_1 = __decorate([
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