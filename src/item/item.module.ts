import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Item } from './item.entity';
import { ItemService } from './item.service';
import { ContractModule } from '../contract/contract.module';
import { PinModule } from '../pin/pin.module';
import { PinService } from '../pin/pin.service';
import { ItemsController } from './item.controller';
import { ConfigService } from '@nestjs/config';
import { TraitModule } from '../traits/trait.module';
import { TraitService } from '../traits/trait.service';
import { RulesModule } from '../rules/rule.module';
import { RuleService } from '../rules/rule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    ContractModule,
    PinModule,
    TraitModule,
    RulesModule,
  ],
  controllers: [ItemsController],
  providers: [
    ItemService,
    PinService,
    ConfigService,
    TraitService,
    RuleService,
  ],
  exports: [TypeOrmModule, ItemService],
})
export class ItemModule {}
