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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../order/order.entity");
const order_item_entity_1 = require("../order/order-item.entity");
const product_entity_1 = require("../product/product.entity");
const user_entity_1 = require("../user/user.entity");
let DashboardService = class DashboardService {
    constructor(orderRepository, orderItemRepository, productRepository, userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }
    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayOrders = await this.orderRepository.count({
            where: {
                created_at: (0, typeorm_2.Between)(today, tomorrow),
            },
        });
        const todaySales = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.pay_amount)', 'total')
            .where('order.created_at >= :today', { today })
            .andWhere('order.status != :status', { status: 'cancelled' })
            .getRawOne();
        const productCount = await this.productRepository.count({
            where: { status: 1 },
        });
        const userCount = await this.userRepository.count();
        const todayNewUsers = await this.userRepository.count({
            where: { created_at: (0, typeorm_2.Between)(today, tomorrow) },
        });
        const lowStockCount = await this.productRepository
            .createQueryBuilder('p')
            .where('p.status = :status', { status: 1 })
            .andWhere('p.stock < :stock', { stock: 10 })
            .getCount();
        const pendingOrders = await this.orderRepository.count({
            where: { status: 'paid' },
        });
        return {
            today_orders: todayOrders,
            today_sales: parseFloat(todaySales?.total || 0),
            product_count: productCount,
            user_count: userCount,
            today_new_users: todayNewUsers,
            low_stock_count: lowStockCount,
            pending_orders: pendingOrders,
        };
    }
    async getSalesTrend(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(0, 0, 0, 0);
        const rows = await this.orderRepository
            .createQueryBuilder('o')
            .select("DATE(o.created_at)", 'date')
            .addSelect('COUNT(o.id)', 'orders')
            .addSelect('COALESCE(SUM(o.pay_amount), 0)', 'sales')
            .where('o.created_at >= :startDate', { startDate })
            .andWhere('o.created_at < :endDate', { endDate })
            .andWhere('o.status != :status', { status: 'cancelled' })
            .groupBy("DATE(o.created_at)")
            .orderBy("DATE(o.created_at)", 'ASC')
            .getRawMany();
        const dataMap = new Map();
        for (const row of rows) {
            const dateStr = typeof row.date === 'string' ? row.date.slice(0, 10) : '';
            dataMap.set(dateStr, {
                orders: parseInt(row.orders) || 0,
                sales: parseFloat(row.sales) || 0,
            });
        }
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().slice(0, 10);
            const data = dataMap.get(dateStr);
            result.push({
                date: dateStr,
                orders: data?.orders || 0,
                sales: data?.sales || 0,
            });
        }
        return result;
    }
    async getProductRanking(limit = 5) {
        const rows = await this.orderItemRepository
            .createQueryBuilder('oi')
            .select('oi.product_title', 'name')
            .addSelect('SUM(oi.quantity)', 'sales')
            .addSelect('SUM(oi.subtotal)', 'amount')
            .groupBy('oi.product_id')
            .addGroupBy('oi.product_title')
            .orderBy('SUM(oi.quantity)', 'DESC')
            .limit(limit)
            .getRawMany();
        return rows.map(r => ({
            name: r.name,
            sales: parseInt(r.sales) || 0,
            amount: parseFloat(r.amount) || 0,
        }));
    }
    async getLatestOrders(limit = 5) {
        const orders = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoin('user', 'u', 'u.id = o.user_id')
            .select(['o.id', 'o.order_no', 'o.pay_amount', 'o.status', 'o.created_at'])
            .addSelect('u.nickname', 'user_nickname')
            .addSelect('u.phone', 'user_phone')
            .orderBy('o.created_at', 'DESC')
            .limit(limit)
            .getRawMany();
        return orders.map(o => ({
            id: o.o_id,
            order_no: o.o_order_no,
            user: o.user_nickname || o.user_phone || null,
            amount: o.o_pay_amount,
            status: o.o_status,
            created_at: o.o_created_at,
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map