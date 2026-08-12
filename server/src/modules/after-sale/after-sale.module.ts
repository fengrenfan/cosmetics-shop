import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AfterSale } from './after-sale.entity';
import { AfterSaleService } from './after-sale.service';
import { AfterSaleController } from './after-sale.controller';
import { Order } from '../order/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AfterSale, Order])],
  controllers: [AfterSaleController],
  providers: [AfterSaleService],
  exports: [AfterSaleService],
})
export class AfterSaleModule {}
