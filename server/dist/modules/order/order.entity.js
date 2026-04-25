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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const order_item_entity_1 = require("./order-item.entity");
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, name: 'order_no' }),
    __metadata("design:type", String)
], Order.prototype, "order_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Order.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'pending' }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' }),
    __metadata("design:type", Number)
], Order.prototype, "total_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'freight_amount' }),
    __metadata("design:type", Number)
], Order.prototype, "freight_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, name: 'pay_amount' }),
    __metadata("design:type", Number)
], Order.prototype, "pay_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'pay_time' }),
    __metadata("design:type", Date)
], Order.prototype, "pay_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, name: 'pay_channel' }),
    __metadata("design:type", String)
], Order.prototype, "pay_channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, name: 'pay_scene' }),
    __metadata("design:type", String)
], Order.prototype, "pay_scene", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'unpaid', name: 'pay_status' }),
    __metadata("design:type", String)
], Order.prototype, "pay_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true, name: 'out_trade_no' }),
    __metadata("design:type", String)
], Order.prototype, "out_trade_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true, name: 'third_trade_no' }),
    __metadata("design:type", String)
], Order.prototype, "third_trade_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'paid_at' }),
    __metadata("design:type", Date)
], Order.prototype, "paid_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'notify_at' }),
    __metadata("design:type", Date)
], Order.prototype, "notify_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, name: 'pay_fail_reason' }),
    __metadata("design:type", String)
], Order.prototype, "pay_fail_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'notify_payload' }),
    __metadata("design:type", String)
], Order.prototype, "notify_payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'ship_time' }),
    __metadata("design:type", Date)
], Order.prototype, "ship_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'receive_time' }),
    __metadata("design:type", Date)
], Order.prototype, "receive_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'complete_time' }),
    __metadata("design:type", Date)
], Order.prototype, "complete_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'address_id' }),
    __metadata("design:type", Number)
], Order.prototype, "address_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'address_snapshot' }),
    __metadata("design:type", Object)
], Order.prototype, "address_snapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 512, nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, name: 'express_company' }),
    __metadata("design:type", String)
], Order.prototype, "express_company", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true, name: 'express_no' }),
    __metadata("design:type", String)
], Order.prototype, "express_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'coupon_amount' }),
    __metadata("design:type", Number)
], Order.prototype, "coupon_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'coupon_id' }),
    __metadata("design:type", Number)
], Order.prototype, "coupon_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'cancel_time' }),
    __metadata("design:type", Date)
], Order.prototype, "cancel_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, name: 'cancel_reason' }),
    __metadata("design:type", String)
], Order.prototype, "cancel_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, name: 'points_amount' }),
    __metadata("design:type", Number)
], Order.prototype, "points_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'points_money' }),
    __metadata("design:type", Number)
], Order.prototype, "points_money", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Order.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Order.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, (item) => item.order),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('order'),
    (0, typeorm_1.Index)('idx_pay_status', ['pay_status']),
    (0, typeorm_1.Index)('idx_out_trade_no', ['out_trade_no'])
], Order);
//# sourceMappingURL=order.entity.js.map