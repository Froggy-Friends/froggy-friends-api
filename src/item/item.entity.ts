import { Attribute } from "src/models/Attribute";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'Item', synchronize: false})
export class Item {
  @PrimaryColumn() id: number;
  @Column() name: string;
  @Column() description: string;
  @Column() category: string;
  @Column() image: string;
  @Column() imageTransparent: string;
  @Column() previewImage: string;
  @Column() twitter: string;
  @Column() discord: string;
  @Column() website: string;
  @Column() endDate: number;
  @Column() collabId: number;
  @Column() isCommunity: boolean;
  @Column() isBoost: boolean;
  @Column() isTrait: boolean;
  @Column() isPhysical: boolean;
  @Column() isAllowlist: boolean;
  @Column() rarity: string;
  @Column() boost: number;
  @Column() friendOrigin: string;
  @Column() traitLayer: string;
  @Column() price: number;
  @Column() percent: number;
  @Column() minted: number;
  @Column() supply: number;
  @Column() walletLimit: number;
  @Column() isOnSale: boolean;
  attributes: Attribute[];
}