import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { PointsModule } from '../points/points.module';
import { UserCheckin } from './user-checkin.entity';
import { UserTaskLog } from './user-task-log.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCheckin, UserTaskLog, User]),
    PointsModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
