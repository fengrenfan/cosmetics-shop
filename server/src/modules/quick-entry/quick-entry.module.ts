import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuickEntry } from './quick-entry.entity';
import { QuickEntryService } from './quick-entry.service';
import { QuickEntryController } from './quick-entry.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuickEntry])],
  controllers: [QuickEntryController],
  providers: [QuickEntryService],
  exports: [QuickEntryService],
})
export class QuickEntryModule {}
