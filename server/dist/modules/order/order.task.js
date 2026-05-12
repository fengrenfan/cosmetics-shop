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
var OrderTask_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTask = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./order.entity");
const order_service_1 = require("./order.service");
let OrderTask = OrderTask_1 = class OrderTask {
    constructor(orderRepository, orderService) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.logger = new common_1.Logger(OrderTask_1.name);
    }
    async handlePendingTimeout() {
        const deadline = new Date(Date.now() - 30 * 60 * 1000);
        const expiredOrders = await this.orderRepository.find({
            where: {
                status: 'pending',
                pay_status: 'unpaid',
                created_at: (0, typeorm_2.LessThan)(deadline),
            },
            take: 50,
            order: { created_at: 'ASC' },
        });
        if (expiredOrders.length === 0)
            return;
        this.logger.log(`发现 ${expiredOrders.length} 笔超时未支付订单，开始自动取消`);
        for (const order of expiredOrders) {
            try {
                await this.orderService.cancel(order.id, '超时未支付自动取消');
                this.logger.log(`订单 ${order.order_no} 已自动取消`);
            }
            catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                this.logger.error(`订单 ${order.order_no} 自动取消失败: ${msg}`);
            }
        }
    }
};
exports.OrderTask = OrderTask;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderTask.prototype, "handlePendingTimeout", null);
exports.OrderTask = OrderTask = OrderTask_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        order_service_1.OrderService])
], OrderTask);
//# sourceMappingURL=order.task.js.map