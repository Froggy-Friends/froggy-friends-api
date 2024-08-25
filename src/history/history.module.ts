import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { History } from './history.entity';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { ContractModule } from '../contract/contract.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([History]), ContractModule, ConfigModule],
  controllers: [HistoryController],
  providers: [HistoryService, ConfigService],
  exports: [TypeOrmModule, HistoryService],
})
export class HistoryModule {}
