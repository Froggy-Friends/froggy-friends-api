import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Metadata } from "src/models/metadata";
import { items } from '../data/items';


@Injectable()
export class ItemsService {

  constructor() {

  }

  getItem(id: string): Metadata {
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      throw new HttpException('Item ID must be a number', HttpStatus.BAD_REQUEST);
    }
    
    const index = items.findIndex(item => item.id === itemId);

    if (index === -1) {
      throw new HttpException('Item ID invalid', HttpStatus.BAD_REQUEST);
    }

    return items[index];
  }

  getItems(): Metadata[] {
    return items;
  }
}