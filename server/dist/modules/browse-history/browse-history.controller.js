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
exports.BrowseHistoryController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const browse_history_service_1 = require("./browse-history.service");
let BrowseHistoryController = class BrowseHistoryController {
    constructor(browseHistoryService) {
        this.browseHistoryService = browseHistoryService;
    }
    async add(body, req) {
        await this.browseHistoryService.addOrUpdate(req.user.id, body.product_id);
        return { code: 0, message: 'success' };
    }
    async getList(req, page = '1', pageSize = '20') {
        const result = await this.browseHistoryService.getList(req.user.id, parseInt(page), parseInt(pageSize));
        return { code: 0, message: 'success', data: result };
    }
    async clear(req) {
        await this.browseHistoryService.clear(req.user.id);
        return { code: 0, message: 'success' };
    }
    async delete(req, productId) {
        await this.browseHistoryService.delete(req.user.id, parseInt(productId));
        return { code: 0, message: 'success' };
    }
};
exports.BrowseHistoryController = BrowseHistoryController;
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BrowseHistoryController.prototype, "add", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], BrowseHistoryController.prototype, "getList", null);
__decorate([
    (0, common_1.Delete)('clear'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BrowseHistoryController.prototype, "clear", null);
__decorate([
    (0, common_1.Delete)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('product_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BrowseHistoryController.prototype, "delete", null);
exports.BrowseHistoryController = BrowseHistoryController = __decorate([
    (0, common_1.Controller)('browse-history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [browse_history_service_1.BrowseHistoryService])
], BrowseHistoryController);
//# sourceMappingURL=browse-history.controller.js.map