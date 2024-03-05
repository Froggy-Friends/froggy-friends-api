import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TraitService } from './trait.service';
import { Trait } from './trait.entity';
import { TraitController } from './trait.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Trait]), ConfigModule],
  controllers: [TraitController],
  providers: [TraitService, ConfigService],
  exports: [TypeOrmModule, TraitService],
})
export class TraitModule {}
