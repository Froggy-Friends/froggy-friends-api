import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { Item } from './item.entity';
import { ItemService } from './item.service';
import { ContractModule } from 'src/contract/contract.module';
import { PinModule } from 'src/pin/pin.module';
import { PinService } from 'src/pin/pin.service';
import { ItemsController } from './item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Item]), ContractModule, PinModule],
  controllers: [ItemsController],
  providers: [ItemService, PinService],
  exports: [TypeOrmModule, ItemService]
})

export class ItemModule {}