import { Metadata } from "./metadata";

export interface RibbitItem extends Metadata {
  price: number;
  percentage: number;
  minted: number;
  supply: number;
  isBoost: boolean;
  isOnSale: boolean;
  walletLimit: number;
}