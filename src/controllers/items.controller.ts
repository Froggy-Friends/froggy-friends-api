import { Controller, Get, Param } from "@nestjs/common";
import { ItemsService } from "../services/items.service";
import { Metadata } from './../models/metadata';
import { ContractMetadata } from '../models/ContractMetadata';

@Controller('/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  getItems(): Metadata[] {
    return this.itemsService.getItems();
  }

  @Get('/:id')
  getItem(@Param('id') id: string): Metadata {
    return this.itemsService.getItem(id);
  }

  @Get('/contract/metadata')
  getContractMetadata(): ContractMetadata {
    return this.itemsService.getContractMetadata();
  }
}