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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const order_service_1 = require("./order.service");
const order_dto_1 = require("./order.dto");
let OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async create(req, dto) {
        dto.user_id = dto.user_id || req.user?.id;
        return this.orderService.create(dto);
    }
    async getList(req, query) {
        query.user_id = query.user_id || req.user?.id;
        return this.orderService.getList(query);
    }
    async getCount(req) {
        if (!req.user?.id) {
            return { pending: 0, paid: 0, shipped: 0, completed: 0 };
        }
        return this.orderService.getCount(req.user.id);
    }
    async getDetail(id) {
        return this.orderService.getDetail(+id);
    }
    async cancel(id, reason) {
        return this.orderService.cancel(+id, reason);
    }
    async confirm(id) {
        return this.orderService.confirm(+id);
    }
    async mockCreate(req) {
        return this.orderService.mockCreate(req.user?.id);
    }
    async getAdminList(query) {
        return this.orderService.getAdminList(query);
    }
    async exportOrders(query, res) {
        const list = await this.orderService.exportOrders(query);
        const statusMap = {
            pending: '待付款', paid: '已付款', shipped: '已发货',
            completed: '已完成', cancelled: '已取消', refunded: '已退款',
        };
        const payStatusMap = {
            unpaid: '未支付', paying: '支付中', paid: '已支付',
            failed: '支付失败', closed: '已关闭', refunding: '退款中', refunded: '已退款',
        };
        const channelMap = { wechat: '微信', alipay: '支付宝' };
        const header = '订单号,用户ID,商品名称,商品金额,运费,优惠券抵扣,实付金额,订单状态,支付状态,支付渠道,下单时间\n';
        const rows = list.map(o => {
            const goodsNames = (o.items || []).map(i => i.product_title).join(';').replace(/,/g, '，');
            const goodsAmount = o.total_amount;
            const createdAt = o.created_at instanceof Date
                ? `${o.created_at.getFullYear()}-${String(o.created_at.getMonth() + 1).padStart(2, '0')}-${String(o.created_at.getDate()).padStart(2, '0')} ${String(o.created_at.getHours()).padStart(2, '0')}:${String(o.created_at.getMinutes()).padStart(2, '0')}`
                : o.created_at;
            return [
                o.order_no, o.user_id, goodsNames, goodsAmount,
                o.freight_amount, o.coupon_amount || 0, o.pay_amount,
                statusMap[o.status] || o.status,
                payStatusMap[o.pay_status] || o.pay_status,
                channelMap[o.pay_channel] || '-',
                createdAt,
            ].join(',');
        }).join('\n');
        const bom = '﻿';
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        res.set({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename=orders_${date}.csv`,
        });
        res.send(bom + header + rows);
    }
    async ship(id, dto) {
        return this.orderService.ship(+id, dto);
    }
    async refund(id) {
        return this.orderService.refund(+id);
    }
    async getTracking(id) {
        return this.orderService.getTracking(+id);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getList", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getCount", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getDetail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "confirm", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('mock/create'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "mockCreate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getAdminList", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/export'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "exportOrders", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('admin/:id/ship'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "ship", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('admin/:id/refund'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "refund", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/:id/tracking'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getTracking", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('order'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map