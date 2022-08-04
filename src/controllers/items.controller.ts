import { Controller, Get, Param } from "@nestjs/common";
import { ItemsService } from "../services/items.service";
import { Metadata } from './../models/metadata';
import { ContractMetadata } from '../models/ContractMetadata';
import { RibbitItem } from "../models/RibbitItem";

@Controller('/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  getItems(): Metadata[] {
    return this.itemsService.getItems();
  }

  // get item metadata from cache plus live contract info
  @Get('/contract')
  getContractItems(): Promise<RibbitItem[]> {
    return this.itemsService.getContractItems();
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