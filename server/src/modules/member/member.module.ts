import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Order } from '../order/order.entity';
import { MemberAdminController } from './member-admin.controller';
import { MemberController } from './member.controller';
import { DepartmentPerformance } from './department-performance.entity';
import { MemberLevel } from './member-level.entity';
import { PerformancePeriod } from './performance-period.entity';
import { MemberService } from './member.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      MemberLevel,
      PerformancePeriod,
      DepartmentPerformance,
    ]),
  ],
  controllers: [MemberController, MemberAdminController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
