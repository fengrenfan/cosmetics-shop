import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityLike } from './community-like.entity';
import { CommunityPost } from './community-post.entity';
import { CommunityService } from './community.service';
import { CommunityComment } from './community-comment.entity';
import { CommunityCommentService } from './community-comment.service';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityPost, CommunityLike, CommunityComment]), TaskModule],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityCommentService],
  exports: [CommunityCommentService],
})
export class CommunityModule {}
