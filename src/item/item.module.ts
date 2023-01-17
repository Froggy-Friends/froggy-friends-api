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

@Module({
  imports: [TypeOrmModule.forFeature([Item]), ContractModule, PinModule, TraitModule],
  controllers: [ItemsController],
  providers: [ItemService, PinService, ConfigService, TraitService],
  exports: [TypeOrmModule, ItemService]
})

export class ItemModule {}