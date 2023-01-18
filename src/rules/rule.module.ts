import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { RuleService } from './rule.service';
import { Rule } from './rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rule])],
  providers: [RuleService, ConfigService],
  exports: [TypeOrmModule, RuleService]
})

export class RulesModule {}