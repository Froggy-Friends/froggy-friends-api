import { Metadata } from "./metadata";

export interface RibbitItem extends Metadata {
  price: number;
  percentage: number;
  minted: number;
  supply: number;
  walletLimit: number;
  isBoost: boolean;
  isOnSale: boolean;
}