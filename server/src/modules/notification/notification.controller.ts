import { Controller, Get, Put, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  @Get()
  async getList(@Request() req, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.notifService.getUserNotifications(req.user.id, page || 1, limit || 20);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.notifService.getUnreadCount(req.user.id);
  }

  @Put(':id/read')
  async markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.notifService.markAsRead(req.user.id, id);
  }

  @Put('read-all')
  async markAllAsRead(@Request() req) {
    return this.notifService.markAllAsRead(req.user.id);
  }
}
