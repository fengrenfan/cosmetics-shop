import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommunityPostDto } from './community.dto';
import { CommunityService } from './community.service';
import { CommunityCommentService } from './community-comment.service';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService, private readonly commentService: CommunityCommentService) {}

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

  // ==================== 评论接口 ====================

  @Post(':id/comments')
  async createComment(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: { content: string; parent_id?: number; reply_user_id?: number },
  ) {
    return this.commentService.create(req.user.id, +id, dto.content, dto.parent_id, dto.reply_user_id);
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentService.getByPost(+id, parseInt(page) || 1, parseInt(limit) || 20);
  }
}