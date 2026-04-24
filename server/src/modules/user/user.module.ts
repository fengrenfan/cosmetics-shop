import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { FavoriteModule } from '../favorite/favorite.module';
import { CouponModule } from '../coupon/coupon.module';
import { OrderModule } from '../order/order.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FavoriteModule,
    CouponModule,
    OrderModule,
    PointsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, PointsModule],
})
export class UserModule {}
