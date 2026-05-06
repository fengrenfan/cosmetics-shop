import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';
import { Product } from '../product/product.entity';
import { DictModule } from '../dict/dict.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product]), DictModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
