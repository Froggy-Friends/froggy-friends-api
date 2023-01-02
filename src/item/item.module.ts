import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { Item } from './item.entity';
import { ItemService } from './item.service';
import { ContractService } from 'src/contract/contract.service';
import { ContractModule } from 'src/contract/contract.module';

@Module({
  imports: [TypeOrmModule.forFeature([Item]), ContractModule],
  providers: [ItemService],
  exports: [TypeOrmModule, ItemService]
})

export class ItemModule {}