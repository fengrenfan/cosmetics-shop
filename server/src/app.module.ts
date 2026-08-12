import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { AddressModule } from './modules/address/address.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { BannerModule } from './modules/banner/banner.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { UploadModule } from './modules/upload/upload.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DictModule } from './modules/dict/dict.module';
import { ProductRecommendModule } from './modules/product-recommend/product-recommend.module';
import { QuickEntryModule } from './modules/quick-entry/quick-entry.module';
import { BrowseHistoryModule } from './modules/browse-history/browse-history.module';
import { PointsModule } from './modules/points/points.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CommunityModule } from './modules/community/community.module';
import { MemberModule } from './modules/member/member.module';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 数据库配置
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
      connectTimeout: 60000,
    }),

    // JWT 配置
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '7d' },
    }),

    // 定时任务
    ScheduleModule.forRoot(),

    // 功能模块
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    CartModule,
    OrderModule,
    AddressModule,
    CouponModule,
    BannerModule,
    FavoriteModule,
    UploadModule,
    DashboardModule,
    DictModule,
    ProductRecommendModule,
    QuickEntryModule,
    BrowseHistoryModule,
    PointsModule,
    PaymentModule,
    CommunityModule,
    MemberModule,
    TaskModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
