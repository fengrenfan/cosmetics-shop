import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendService } from './recommend.service';
import { RecommendController } from './recommend.controller';
import { Product } from '../product/product.entity';
import { BrowseHistory } from '../browse-history/browse-history.entity';
import { Favorite } from '../favorite/favorite.entity';
import { OrderItem } from '../order/order-item.entity';
import { Cart } from '../cart/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, BrowseHistory, Favorite, OrderItem, Cart])],
  controllers: [RecommendController],
  providers: [RecommendService],
  exports: [RecommendService],
})
export class RecommendModule {}
