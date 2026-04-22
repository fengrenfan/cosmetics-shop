import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRecommend } from './product-recommend.entity';
import { Product } from '../product/product.entity';
import { ProductRecommendService } from './product-recommend.service';
import { ProductRecommendController } from './product-recommend.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductRecommend, Product])],
  controllers: [ProductRecommendController],
  providers: [ProductRecommendService],
  exports: [ProductRecommendService],
})
export class ProductRecommendModule {}
