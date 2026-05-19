import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TaskService } from './task.service';

@Controller('task')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('center')
  async center(@Request() req: { user: { id: number } }) {
    return this.taskService.getCenter(req.user.id);
  }

  @Post('checkin')
  async checkin(@Request() req: { user: { id: number } }) {
    return this.taskService.checkin(req.user.id);
  }

  @Get('invite-qrcode')
  async inviteQrcode(@Request() req: { user: { id: number } }) {
    return this.taskService.getInviteQrcode(req.user.id);
  }
}
