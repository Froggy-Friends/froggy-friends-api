import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { History } from './history.entity';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([History])],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [TypeOrmModule, HistoryService]
})

export class HistoryModule {}