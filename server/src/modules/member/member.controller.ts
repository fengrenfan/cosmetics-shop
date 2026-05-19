import { BadRequestException, Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MemberService } from './member.service';

@Controller('member')
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.memberService.getProfile(req.user.id);
  }

  @Get('team-stats')
  getTeamStats(@Request() req) {
    return this.memberService.getTeamStats(req.user.id);
  }

  @Get('periods')
  getPeriods() {
    return this.memberService.getPeriods();
  }

  @Get('departments')
  getDepartments(@Request() req, @Query('period_id') periodId: string) {
    const id = parseInt(periodId, 10);
    if (!id) throw new BadRequestException('请选择考核期');
    return this.memberService.getDepartments(req.user.id, id);
  }
}
