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
exports.ProductRecommendController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const product_recommend_service_1 = require("./product-recommend.service");
let ProductRecommendController = class ProductRecommendController {
    constructor(productRecommendService) {
        this.productRecommendService = productRecommendService;
    }
    async getRecommendIds(type = 'home') {
        const recommends = await this.productRecommendService.getRecommendProducts(type);
        return recommends.map(r => r.product_id);
    }
    async getAdminList() {
        return this.productRecommendService.getAllList();
    }
    async getHotAdminList() {
        return this.productRecommendService.getListByType('hot');
    }
    async getRecommendProducts() {
        return this.productRecommendService.getRecommendProductsWithDetail('home');
    }
    async getHotProducts() {
        return this.productRecommendService.getHotProductsWithDetail();
    }
    async create(dto) {
        return this.productRecommendService.create(dto);
    }
    async update(id, dto) {
        return this.productRecommendService.update(id, dto);
    }
    async delete(id) {
        return this.productRecommendService.delete(id);
    }
};
exports.ProductRecommendController = ProductRecommendController;
__decorate([
    (0, common_1.Get)('ids'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductRecommendController.prototype, "getRecommendIds", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductRecommendController.prototype, "getAdminList", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('hot-admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductRecommendController.prototype, "getHotAdminList", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductRecommendController.prototype, "getRecommendProducts", null);
__decorate([
    (0, common_1.Get)('hot'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductRecommendController.prototype, "getHotProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductRecommendController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductRecommendController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductRecommendController.prototype, "delete", null);
exports.ProductRecommendController = ProductRecommendController = __decorate([
    (0, common_1.Controller)('product-recommend'),
    __metadata("design:paramtypes", [product_recommend_service_1.ProductRecommendService])
], ProductRecommendController);
//# sourceMappingURL=product-recommend.controller.js.map