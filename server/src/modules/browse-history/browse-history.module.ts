import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrowseHistory } from './browse-history.entity';
import { BrowseHistoryService } from './browse-history.service';
import { BrowseHistoryController } from './browse-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BrowseHistory])],
  controllers: [BrowseHistoryController],
  providers: [BrowseHistoryService],
  exports: [BrowseHistoryService],
})
export class BrowseHistoryModule {}
