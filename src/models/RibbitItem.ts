import { ItemMetadata } from "./ItemMetadata";

export interface RibbitItem extends ItemMetadata {
  price: number;
  percentage: number;
  minted: number;
  supply: number;
  walletLimit: number;
  isBoost: boolean;
  isOnSale: boolean;
}