import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AfterSale } from './after-sale.entity';
import { AfterSaleService } from './after-sale.service';
import { AfterSaleController } from './after-sale.controller';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AfterSale, Order, User]), AuthModule],
  controllers: [AfterSaleController],
  providers: [AfterSaleService],
  exports: [AfterSaleService],
})
export class AfterSaleModule {}
