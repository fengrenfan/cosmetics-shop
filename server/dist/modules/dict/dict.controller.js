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
exports.DictController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const dict_service_1 = require("./dict.service");
let DictController = class DictController {
    constructor(dictService) {
        this.dictService = dictService;
    }
    async getAllDictsWithItems() {
        return this.dictService.getAllDictsWithItems();
    }
    async getDictList() {
        return this.dictService.getDictList();
    }
    async createDict(dto) {
        return this.dictService.createDict(dto);
    }
    async updateDict(id, dto) {
        return this.dictService.updateDict(id, dto);
    }
    async deleteDict(id) {
        return this.dictService.deleteDict(id);
    }
    async getDictItems(dictId) {
        return this.dictService.getDictItems(dictId ? parseInt(dictId) : undefined);
    }
    async createDictItem(dto) {
        return this.dictService.createDictItem(dto);
    }
    async updateDictItem(id, dto) {
        return this.dictService.updateDictItem(id, dto);
    }
    async deleteDictItem(id) {
        return this.dictService.deleteDictItem(id);
    }
};
exports.DictController = DictController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DictController.prototype, "getAllDictsWithItems", null);
__decorate([
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DictController.prototype, "getDictList", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "createDict", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "updateDict", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "deleteDict", null);
__decorate([
    (0, common_1.Get)('item'),
    __param(0, (0, common_1.Query)('dictId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "getDictItems", null);
__decorate([
    (0, common_1.Post)('item'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "createDictItem", null);
__decorate([
    (0, common_1.Put)('item/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "updateDictItem", null);
__decorate([
    (0, common_1.Delete)('item/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "deleteDictItem", null);
exports.DictController = DictController = __decorate([
    (0, common_1.Controller)('dict'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dict_service_1.DictService])
], DictController);
//# sourceMappingURL=dict.controller.js.map