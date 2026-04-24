import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointLog } from './points.entity';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointLog, User])],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}