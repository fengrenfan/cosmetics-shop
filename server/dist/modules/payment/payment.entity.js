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
exports.PaymentRecord = void 0;
const typeorm_1 = require("typeorm");
let PaymentRecord = class PaymentRecord {
};
exports.PaymentRecord = PaymentRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id' }),
    __metadata("design:type", Number)
], PaymentRecord.prototype, "order_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, name: 'order_no' }),
    __metadata("design:type", String)
], PaymentRecord.prototype, "order_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], PaymentRecord.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, name: 'pay_channel' }),
    __metadata("design:type", String)
], PaymentRecord.prototype, "pay_channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, name: 'pay_scene' }),
    __metadata("design:type", String)
], PaymentRecord.prototype, "pay_scene", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'paying' }),
    __metadata("design:type", String)
], PaymentRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, name: 'out_trade_no' }),
    __metadata("design:type", String)
], PaymentRecord.prototype, "out_trade_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64, nullable: true, name: 'third_trade_no' }),
    __metadata("design:type", String)
], PaymentRecord.prototype, "third_trade_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, name: 'amount' }),
    __metadata("design:type", Number)
], PaymentRecord.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'client_payload' }),
    __metadata("design:type", String)
], PaymentRecord.prototype, "client_payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'notify_payload' }),
    __metadata("design:type", String)
], PaymentRecord.prototype, "notify_payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'paid_at' }),
    __metadata("design:type", Date)
], PaymentRecord.prototype, "paid_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'notify_at' }),
    __metadata("design:type", Date)
], PaymentRecord.prototype, "notify_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PaymentRecord.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PaymentRecord.prototype, "updated_at", void 0);
exports.PaymentRecord = PaymentRecord = __decorate([
    (0, typeorm_1.Entity)('payment_record'),
    (0, typeorm_1.Unique)('uk_out_trade_no', ['out_trade_no']),
    (0, typeorm_1.Index)('idx_order', ['order_id']),
    (0, typeorm_1.Index)('idx_user', ['user_id'])
], PaymentRecord);
//# sourceMappingURL=payment.entity.js.map