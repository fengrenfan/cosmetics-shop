"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const product_module_1 = require("./modules/product/product.module");
const category_module_1 = require("./modules/category/category.module");
const cart_module_1 = require("./modules/cart/cart.module");
const order_module_1 = require("./modules/order/order.module");
const address_module_1 = require("./modules/address/address.module");
const coupon_module_1 = require("./modules/coupon/coupon.module");
const banner_module_1 = require("./modules/banner/banner.module");
const favorite_module_1 = require("./modules/favorite/favorite.module");
const upload_module_1 = require("./modules/upload/upload.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const dict_module_1 = require("./modules/dict/dict.module");
const product_recommend_module_1 = require("./modules/product-recommend/product-recommend.module");
const quick_entry_module_1 = require("./modules/quick-entry/quick-entry.module");
const browse_history_module_1 = require("./modules/browse-history/browse-history.module");
const points_module_1 = require("./modules/points/points.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 3306,
                username: process.env.DB_USER || 'cosmetics',
                password: process.env.DB_PASSWORD || 'cosmetics123',
                database: process.env.DB_NAME || 'cosmetics_shop',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
                logging: false,
            }),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'cosmetics-shop-secret-2024',
                signOptions: { expiresIn: '7d' },
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            product_module_1.ProductModule,
            category_module_1.CategoryModule,
            cart_module_1.CartModule,
            order_module_1.OrderModule,
            address_module_1.AddressModule,
            coupon_module_1.CouponModule,
            banner_module_1.BannerModule,
            favorite_module_1.FavoriteModule,
            upload_module_1.UploadModule,
            dashboard_module_1.DashboardModule,
            dict_module_1.DictModule,
            product_recommend_module_1.ProductRecommendModule,
            quick_entry_module_1.QuickEntryModule,
            browse_history_module_1.BrowseHistoryModule,
            points_module_1.PointsModule,
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_interceptor_1.ResponseInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map