import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommunityPostDto } from './community.dto';
import { CommunityService } from './community.service';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('list')
  async getList(@Request() req, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.communityService.getList(req.user.id, parseInt(page) || 1, parseInt(pageSize) || 10);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateCommunityPostDto) {
    return this.communityService.create(req.user.id, dto);
  }

  @Post(':id/like')
  async toggleLike(@Request() req, @Param('id') id: string) {
    return this.communityService.toggleLike(req.user.id, +id);
  }
}
