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
exports.UserCoupon = exports.Coupon = void 0;
const typeorm_1 = require("typeorm");
let Coupon = class Coupon {
};
exports.Coupon = Coupon;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Coupon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Coupon.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Coupon.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Coupon.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'min_amount' }),
    __metadata("design:type", Number)
], Coupon.prototype, "min_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'max_discount' }),
    __metadata("design:type", Number)
], Coupon.prototype, "max_discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_count' }),
    __metadata("design:type", Number)
], Coupon.prototype, "total_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'used_count' }),
    __metadata("design:type", Number)
], Coupon.prototype, "used_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, name: 'per_limit' }),
    __metadata("design:type", Number)
], Coupon.prototype, "per_limit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', name: 'start_time' }),
    __metadata("design:type", Date)
], Coupon.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', name: 'end_time' }),
    __metadata("design:type", Date)
], Coupon.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Coupon.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Coupon.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Coupon.prototype, "updated_at", void 0);
exports.Coupon = Coupon = __decorate([
    (0, typeorm_1.Entity)('coupon')
], Coupon);
let UserCoupon = class UserCoupon {
};
exports.UserCoupon = UserCoupon;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserCoupon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], UserCoupon.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coupon_id' }),
    __metadata("design:type", Number)
], UserCoupon.prototype, "coupon_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'unused' }),
    __metadata("design:type", String)
], UserCoupon.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', name: 'claimed_at' }),
    __metadata("design:type", Date)
], UserCoupon.prototype, "claimed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'used_at' }),
    __metadata("design:type", Date)
], UserCoupon.prototype, "used_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'order_id' }),
    __metadata("design:type", Number)
], UserCoupon.prototype, "order_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Coupon),
    (0, typeorm_1.JoinColumn)({ name: 'coupon_id' }),
    __metadata("design:type", Coupon)
], UserCoupon.prototype, "coupon", void 0);
exports.UserCoupon = UserCoupon = __decorate([
    (0, typeorm_1.Entity)('user_coupon')
], UserCoupon);
//# sourceMappingURL=coupon.entity.js.map