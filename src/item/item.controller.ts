import { Controller, Get, Param, Post } from "@nestjs/common";
import { RibbitItem } from "../models/RibbitItem";
import { ItemService } from "./item.service";

@Controller('/items')
export class ItemsController {
  constructor(private readonly itemService: ItemService) {} 

  @Get()
  getContractItems(): Promise<RibbitItem[]> {
    return this.itemService.getAllItems();
  }

  @Get('/owned/:account')
  async getOwnedItems(@Param('account') account: string): Promise<RibbitItem[]> {
    return this.itemService.getOwnedItems(account);
  }

  @Get('/:id/owners')
  getItemOwners(@Param('id') id: number) {
    return this.itemService.getItemOwners(id); 
  }

  @Get('/:id/tickets')
  getRaffleTickets(@Param('id') id: number) {
    return this.itemService.getRaffleTickets(id);
  }
}