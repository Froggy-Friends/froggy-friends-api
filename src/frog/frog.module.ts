import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { Frog } from './frog.entity';
import { FrogService } from './frog.service';
import { FrogController } from './frog.controller';
import { ContractModule } from 'src/contract/contract.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TraitModule } from 'src/traits/trait.module';
import { TraitService } from 'src/traits/trait.service';
import { ContractService } from 'src/contract/contract.service';

@Module({
  imports: [TypeOrmModule.forFeature([Frog]), ContractModule, TraitModule, ConfigModule],
  controllers: [FrogController],
  providers: [FrogService, ConfigService, ContractService, TraitService],
  exports: [TypeOrmModule, FrogService]
})

export class FrogModule { }