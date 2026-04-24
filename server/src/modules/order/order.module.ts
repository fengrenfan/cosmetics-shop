import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { ProductModule } from '../product/product.module';
import { AddressModule } from '../address/address.module';
import { CartModule } from '../cart/cart.module';
import { PointsModule } from '../points/points.module';
import { CouponModule } from '../coupon/coupon.module';
import { UserCoupon } from '../coupon/coupon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, UserCoupon]),
    ProductModule,
    AddressModule,
    CartModule,
    PointsModule,
    CouponModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
