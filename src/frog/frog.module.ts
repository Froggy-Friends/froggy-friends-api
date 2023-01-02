import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { Frog } from './frog.entity';
import { FrogService } from './frog.service';
import { FrogController } from './frog.controller';
import { ContractModule } from 'src/contract/contract.module';

@Module({
  imports: [TypeOrmModule.forFeature([Frog]), ContractModule],
  controllers: [FrogController],
  providers: [FrogService],
  exports: [TypeOrmModule, FrogService]
})

export class FrogModule {}