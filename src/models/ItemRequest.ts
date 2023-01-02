import { Item } from "src/item/item.entity";

export interface ItemRequest {
  admin: string;
  message: string;
  signature: string;
  item: Item;
}