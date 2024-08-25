import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Frog } from './frog.entity';
import { FrogService } from './frog.service';
import { FrogController } from './frog.controller';
import { ContractModule } from '../contract/contract.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TraitModule } from '../traits/trait.module';
import { TraitService } from '../traits/trait.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Frog]),
    ContractModule,
    TraitModule,
    ConfigModule,
  ],
  controllers: [FrogController],
  providers: [FrogService, ConfigService, TraitService],
  exports: [TypeOrmModule, FrogService],
})
export class FrogModule {}
