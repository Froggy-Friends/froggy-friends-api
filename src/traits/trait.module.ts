import { PinModule } from 'src/pin/pin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { TraitService } from './trait.service';
import { Trait } from './trait.entity';
import { TraitController } from './trait.controller';
import { ConfigService } from '@nestjs/config';
import { PinService } from 'src/pin/pin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trait]), PinModule],
  controllers: [TraitController],
  providers: [TraitService, ConfigService, PinService],
  exports: [TypeOrmModule, TraitService]
})

export class TraitModule {}