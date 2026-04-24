"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
const user_entity_1 = require("./user.entity");
const favorite_module_1 = require("../favorite/favorite.module");
const coupon_module_1 = require("../coupon/coupon.module");
const order_module_1 = require("../order/order.module");
const points_module_1 = require("../points/points.module");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            favorite_module_1.FavoriteModule,
            coupon_module_1.CouponModule,
            order_module_1.OrderModule,
            points_module_1.PointsModule,
        ],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService],
        exports: [user_service_1.UserService, points_module_1.PointsModule],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map