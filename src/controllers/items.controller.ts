import { Controller, Get, Param } from "@nestjs/common";
import { ItemsService } from "../services/items.service";
import { ItemMetadata } from '../models/ItemMetadata';
import { ContractMetadata } from '../models/ContractMetadata';
import { RibbitItem } from "../models/RibbitItem";

@Controller('/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  getItems(): ItemMetadata[] {
    return this.itemsService.getItems();
  }

  // endpoint used by website
  @Get('/contract')
  getContractItems(): Promise<RibbitItem[]> {
    return this.itemsService.getContractItems();
  }

  // endpoint used by contract to get item metadata
  @Get('/:id')
  getItem(@Param('id') id: string): Promise<ItemMetadata> {
    return this.itemsService.getItem(id);
  }

  @Get('/contract/metadata')
  getContractMetadata(): ContractMetadata {
    return this.itemsService.getContractMetadata();
  }

  @Get('/owned/:account')
  async getOwnedItems(@Param('account') account: string): Promise<RibbitItem[]> {
    return this.itemsService.getOwnedItems(account);
  }

  @Get('/:id/owners')
  getItemOwners(@Param('id') id: string) {
    return this.itemsService.getItemOwners(id); 
  }

  @Get('/:id/tickets')
  getRaffleTickets(@Param('id') id: string) {
    return this.itemsService.getRaffleTickets(id);
  }
}