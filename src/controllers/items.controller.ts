import { Metadata } from './../models/metadata';
import { Controller, Get, Param } from "@nestjs/common";
import { ItemsService } from "../services/items.service";


@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/items/:id')
  getItem(@Param('id') id: string): Metadata {
    return this.itemsService.getItem(id);
  }
}