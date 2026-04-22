"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRecommendModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_recommend_entity_1 = require("./product-recommend.entity");
const product_entity_1 = require("../product/product.entity");
const product_recommend_service_1 = require("./product-recommend.service");
const product_recommend_controller_1 = require("./product-recommend.controller");
let ProductRecommendModule = class ProductRecommendModule {
};
exports.ProductRecommendModule = ProductRecommendModule;
exports.ProductRecommendModule = ProductRecommendModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([product_recommend_entity_1.ProductRecommend, product_entity_1.Product])],
        controllers: [product_recommend_controller_1.ProductRecommendController],
        providers: [product_recommend_service_1.ProductRecommendService],
        exports: [product_recommend_service_1.ProductRecommendService],
    })
], ProductRecommendModule);
//# sourceMappingURL=product-recommend.module.js.map