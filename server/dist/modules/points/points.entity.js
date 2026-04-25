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
exports.PointLog = void 0;
const typeorm_1 = require("typeorm");
let PointLog = class PointLog {
};
exports.PointLog = PointLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PointLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], PointLog.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint' }),
    __metadata("design:type", Number)
], PointLog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PointLog.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PointLog.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], PointLog.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'order_id' }),
    __metadata("design:type", Number)
], PointLog.prototype, "order_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], PointLog.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'expired_at' }),
    __metadata("design:type", Date)
], PointLog.prototype, "expired_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'deducted_at' }),
    __metadata("design:type", Date)
], PointLog.prototype, "deducted_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, name: 'deducted_points' }),
    __metadata("design:type", Number)
], PointLog.prototype, "deducted_points", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PointLog.prototype, "created_at", void 0);
exports.PointLog = PointLog = __decorate([
    (0, typeorm_1.Entity)('point_log')
], PointLog);
//# sourceMappingURL=points.entity.js.map