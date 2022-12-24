import { Body, Controller, Get, Param, Post, HttpStatus, HttpException } from "@nestjs/common";
import { Item } from "./item.entity";
import { ItemService } from "./item.service";
import { hashMessage } from "ethers/lib/utils";
import { ethers } from "ethers";
import { ItemRequest } from "src/models/ItemRequest";
import { admins } from './item.admins';

@Controller('/items')
export class ItemsController {
  constructor(private readonly itemService: ItemService) {} 

  @Get()
  getContractItems(): Promise<Item[]> {
    return this.itemService.getAllItems();
  }

  @Get(':id')
  getItem(@Param('id') id: number): Promise<Item> {
    return this.itemService.getItem(id);
  }

  @Get('/owned/:account')
  async getOwnedItems(@Param('account') account: string): Promise<Item[]> {
    return this.itemService.getOwnedItems(account);
  }

  @Get('/:id/owners')
  getItemOwners(@Param('id') id: number) {
    return this.itemService.getItemOwners(id); 
  }

  @Get('/:id/tickets')
  getRaffleTickets(@Param('id') id: number) {
    return this.itemService.getRaffleTicketOwners(id);
  }

  @Post()
  listItem(@Body() itemRequest: ItemRequest) {
    // verify wallet
    const signer = ethers.utils.recoverAddress(hashMessage(itemRequest.message), itemRequest.value);

    if (!admins.includes(signer)) {
      throw new HttpException("Unauthorized admin", HttpStatus.BAD_REQUEST);
    }
  }
}