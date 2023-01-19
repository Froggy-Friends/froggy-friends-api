import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { TraitService } from './trait.service';
import { Trait } from './trait.entity';
import { TraitController } from './trait.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Trait])],
  controllers: [TraitController],
  providers: [TraitService],
  exports: [TypeOrmModule, TraitService]
})

export class TraitModule {}