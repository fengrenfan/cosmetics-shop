"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const coupon_controller_1 = require("./coupon.controller");
const coupon_service_1 = require("./coupon.service");
const coupon_cron_1 = require("./coupon.cron");
const coupon_entity_1 = require("./coupon.entity");
let CouponModule = class CouponModule {
};
exports.CouponModule = CouponModule;
exports.CouponModule = CouponModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot(), typeorm_1.TypeOrmModule.forFeature([coupon_entity_1.Coupon, coupon_entity_1.UserCoupon])],
        controllers: [coupon_controller_1.CouponController],
        providers: [coupon_service_1.CouponService, coupon_cron_1.CouponCron],
        exports: [coupon_service_1.CouponService],
    })
], CouponModule);
//# sourceMappingURL=coupon.module.js.map