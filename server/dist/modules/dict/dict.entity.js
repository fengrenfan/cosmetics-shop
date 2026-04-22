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
exports.DictItem = exports.Dict = void 0;
const typeorm_1 = require("typeorm");
let Dict = class Dict {
};
exports.Dict = Dict;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Dict.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, name: 'dict_name' }),
    __metadata("design:type", String)
], Dict.prototype, "dict_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, name: 'dict_code' }),
    __metadata("design:type", String)
], Dict.prototype, "dict_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'description' }),
    __metadata("design:type", String)
], Dict.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, name: 'sort_order' }),
    __metadata("design:type", Number)
], Dict.prototype, "sort_order", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Dict.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Dict.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Dict.prototype, "updated_at", void 0);
exports.Dict = Dict = __decorate([
    (0, typeorm_1.Entity)('dict')
], Dict);
let DictItem = class DictItem {
};
exports.DictItem = DictItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DictItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dict_id' }),
    __metadata("design:type", Number)
], DictItem.prototype, "dict_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, name: 'item_label' }),
    __metadata("design:type", String)
], DictItem.prototype, "item_label", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, name: 'item_value' }),
    __metadata("design:type", String)
], DictItem.prototype, "item_value", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'sort_order' }),
    __metadata("design:type", Number)
], DictItem.prototype, "sort_order", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], DictItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DictItem.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DictItem.prototype, "updated_at", void 0);
exports.DictItem = DictItem = __decorate([
    (0, typeorm_1.Entity)('dict_item')
], DictItem);
//# sourceMappingURL=dict.entity.js.map