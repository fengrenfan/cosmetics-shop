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
exports.CouponController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const coupon_service_1 = require("./coupon.service");
const coupon_dto_1 = require("./coupon.dto");
let CouponController = class CouponController {
    constructor(couponService) {
        this.couponService = couponService;
    }
    async getAvailable(userId) {
        return this.couponService.getAvailable(userId);
    }
    async claim(id, userId) {
        return this.couponService.claim(+id, userId);
    }
    async validate(dto) {
        return this.couponService.validateForOrder(dto.user_id, dto.coupon_id, dto.order_amount);
    }
    async getMyCoupons(userId, status) {
        return this.couponService.getMyCoupons(userId, status);
    }
    async getAdminList() {
        return this.couponService.getAll();
    }
    async create(dto) {
        return this.couponService.create(dto);
    }
    async update(id, dto) {
        return this.couponService.update(id, dto);
    }
    async grant(dto) {
        return this.couponService.grantToUser(dto.user_id, dto.coupon_id);
    }
    async delete(id) {
        return this.couponService.delete(id);
    }
};
exports.CouponController = CouponController;
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Query)('user_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "getAvailable", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('claim/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('user_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "claim", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coupon_dto_1.ValidateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "validate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Query)('user_id')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "getMyCoupons", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "getAdminList", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coupon_dto_1.CreateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('admin/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, coupon_dto_1.UpdateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/grant'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coupon_dto_1.GrantCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "grant", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('admin/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "delete", null);
exports.CouponController = CouponController = __decorate([
    (0, common_1.Controller)('coupon'),
    __metadata("design:paramtypes", [coupon_service_1.CouponService])
], CouponController);
//# sourceMappingURL=coupon.controller.js.map