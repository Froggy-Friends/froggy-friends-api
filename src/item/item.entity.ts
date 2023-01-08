import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'Item', synchronize: false})
export class Item {
  @PrimaryColumn() id: number;
  @Column() name: string;
  @Column() description: string;
  @Column() category: string;
  @Column() image: string;
  @Column() imageTransparent: string;
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

  constructor(item?: any) {
    if (item) {
      this.id = item.itemId;
      this.name = item.name;
      this.description = item.description;
      this.category = item.category;
      this.image = item.image;
      this.imageTransparent = item.imageTransparent;
      this.twitter = item.twitter;
      this.discord = item.discord;
      this.website = item.website;
      this.endDate = item.endDate;
      this.collabId = item.collabId;
      this.isCommunity = item.isCommunity;
      this.isBoost = item.isBoost;
      this.isTrait = item.isTrait;
      this.isPhysical = item.isPhysical;
      this.isAllowlist = item.isAllowlist;
      this.rarity = item.rarity;
      this.boost = item.boost;
      this.friendOrigin = item.friendOrigin;
      this.traitLayer = item.traitLayer;
      this.price = item.price;
      this.percent = item.percent;
      this.minted = item.minted;
      this.supply = item.supply;
      this.walletLimit = item.walletLimit;
      this.isOnSale = item.isOnSale;
    }
  }
}