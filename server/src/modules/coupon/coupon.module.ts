import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponCron } from './coupon.cron';
import { Coupon, UserCoupon } from './coupon.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Coupon, UserCoupon])],
  controllers: [CouponController],
  providers: [CouponService, CouponCron],
  exports: [CouponService],
})
export class CouponModule {}
