import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityLike } from './community-like.entity';
import { CommunityPost } from './community-post.entity';
import { CommunityService } from './community.service';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityPost, CommunityLike]), TaskModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
