import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityLike } from './community-like.entity';
import { CommunityPost } from './community-post.entity';
import { CommunityService } from './community.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityPost, CommunityLike])],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
