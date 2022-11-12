import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { Item } from './item.entity';
import { ItemService } from './item.service';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  providers: [ItemService],
  exports: [TypeOrmModule, ItemService]
})

export class ItemModule {}