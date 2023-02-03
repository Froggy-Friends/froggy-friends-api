import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { Item } from './item.entity';
import { ItemService } from './item.service';
import { ContractModule } from 'src/contract/contract.module';
import { PinModule } from 'src/pin/pin.module';
import { PinService } from 'src/pin/pin.service';
import { ItemsController } from './item.controller';
import { ConfigService } from '@nestjs/config';
import { TraitModule } from 'src/traits/trait.module';
import { TraitService } from 'src/traits/trait.service';
import { RulesModule } from 'src/rules/rule.module';
import { RuleService } from 'src/rules/rule.service';

@Module({
  imports: [TypeOrmModule.forFeature([Item]), ContractModule, PinModule, TraitModule, RulesModule],
  controllers: [ItemsController],
  providers: [ItemService, PinService, ConfigService, TraitService, RuleService],
  exports: [TypeOrmModule, ItemService]
})

export class ItemModule {}