import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateMemberLevelDto,
  CreatePerformancePeriodDto,
  UpdateDepartmentPerformanceDto,
  UpdateMemberLevelDto,
  UpdatePerformancePeriodDto,
  UpdateUserMemberDto,
} from './member.dto';
import { MemberService } from './member.service';

@Controller('member/admin')
@UseGuards(JwtAuthGuard)
export class MemberAdminController {
  constructor(private readonly memberService: MemberService) {}

  // ─── 等级管理 ───

  @Get('levels')
  getLevels() {
    return this.memberService.getLevelList();
  }

  @Post('levels')
  createLevel(@Body() dto: CreateMemberLevelDto) {
    return this.memberService.createLevel(dto);
  }

  @Put('levels/:id')
  updateLevel(@Param('id') id: string, @Body() dto: UpdateMemberLevelDto) {
    return this.memberService.updateLevel(+id, dto);
  }

  @Delete('levels/:id')
  deleteLevel(@Param('id') id: string) {
    return this.memberService.deleteLevel(+id);
  }

  // ─── 考核期管理 ───

  @Get('periods')
  getPeriods() {
    return this.memberService.getPeriodList();
  }

  @Post('periods')
  createPeriod(@Body() dto: CreatePerformancePeriodDto) {
    return this.memberService.createPeriod(dto);
  }

  @Put('periods/:id')
  updatePeriod(@Param('id') id: string, @Body() dto: UpdatePerformancePeriodDto) {
    return this.memberService.updatePeriod(+id, dto);
  }

  @Delete('periods/:id')
  deletePeriod(@Param('id') id: string) {
    return this.memberService.deletePeriod(+id);
  }

  // ─── 用户会员信息 ───

  @Get('users/:id')
  getUserMemberDetail(@Param('id') id: string) {
    return this.memberService.getUserMemberDetail(+id);
  }

  @Put('users/:id')
  updateUserMember(@Param('id') id: string, @Body() dto: UpdateUserMemberDto) {
    return this.memberService.updateUserMember(+id, dto);
  }

  // ─── 部门业绩 ───

  @Get('departments')
  getDepartments(
    @Query('owner_user_id') ownerUserId: string,
    @Query('period_id') periodId: string,
  ) {
    return this.memberService.getAdminDepartments(+ownerUserId, +periodId);
  }

  @Put('departments/:id')
  updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentPerformanceDto) {
    return this.memberService.updateDepartmentPerformance(+id, dto);
  }

  @Post('departments/recalculate')
  recalculate(
    @Body() body: { owner_user_id: number; period_id: number },
  ) {
    return this.memberService.recalculateDepartments(body.owner_user_id, body.period_id);
  }

  @Post('departments/upsert')
  upsertDepartment(
    @Body()
    body: {
      owner_user_id: number;
      direct_user_id: number;
      period_id: number;
    } & UpdateDepartmentPerformanceDto,
  ) {
    const { owner_user_id, direct_user_id, period_id, ...dto } = body;
    return this.memberService.upsertDepartmentPerformance(
      owner_user_id,
      direct_user_id,
      period_id,
      dto,
    );
  }

  @Delete('departments/:id')
  deleteDepartment(@Param('id') id: string) {
    return this.memberService.deleteDepartmentPerformance(+id);
  }
}
