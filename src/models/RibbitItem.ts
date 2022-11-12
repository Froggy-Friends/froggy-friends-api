import { Item } from "src/item/item.entity";

export interface RibbitItem extends Item {
  price: number;
  percentage: number;
  minted: number;
  supply: number;
  walletLimit: number;
  isBoost: boolean;
  isOnSale: boolean;
}