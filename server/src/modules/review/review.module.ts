import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Order } from '../order/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Order])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
