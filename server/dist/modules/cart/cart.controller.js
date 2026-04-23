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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const cart_service_1 = require("./cart.service");
const cart_dto_1 = require("./cart.dto");
let CartController = class CartController {
    constructor(cartService) {
        this.cartService = cartService;
    }
    async getList(req) {
        const userId = req.user?.id || null;
        const deviceId = req.headers['x-device-id'] || null;
        return this.cartService.getList(userId, deviceId);
    }
    async add(dto, req) {
        const userId = req.user?.id || null;
        const deviceId = req.headers['x-device-id'] || null;
        return this.cartService.add({ ...dto, user_id: userId, device_id: deviceId });
    }
    async update(id, dto) {
        return this.cartService.update(+id, dto);
    }
    async remove(id) {
        return this.cartService.remove(+id);
    }
    async batchRemove(ids) {
        return this.cartService.batchRemove(ids);
    }
    async updateChecked(dto, req) {
        const userId = req.user?.id || null;
        const deviceId = req.headers['x-device-id'] || null;
        return this.cartService.updateChecked(dto.ids, dto.checked, userId, deviceId);
    }
    async getRecommend(req) {
        const userId = req.user?.id || null;
        const deviceId = req.headers['x-device-id'] || null;
        return this.cartService.getRecommend(userId, deviceId);
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getList", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cart_dto_1.AddCartDto, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "add", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cart_dto_1.UpdateCartDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('batch'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "batchRemove", null);
__decorate([
    (0, common_1.Put)('checked'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cart_dto_1.UpdateCheckedDto, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateChecked", null);
__decorate([
    (0, common_1.Get)('recommend'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getRecommend", null);
exports.CartController = CartController = __decorate([
    (0, common_1.Controller)('cart'),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map