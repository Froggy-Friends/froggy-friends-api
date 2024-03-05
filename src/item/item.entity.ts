import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Item', synchronize: false })
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
  @Column() collabAddress: string;
  @Column() isCommunity: boolean;
  @Column() isBoost: boolean;
  @Column() isFriend: boolean;
  @Column() isCollabFriend: boolean;
  @Column() isTrait: boolean;
  @Column() isPhysical: boolean;
  @Column() isAllowlist: boolean;
  @Column() rarity: string;
  @Column() friendOrigin: string;
  @Column() traitLayer: string;
  @Column() traitId: number;
  @Column() price: number;
  @Column() percent: number;
  @Column() minted: number;
  @Column() supply: number;
  @Column() walletLimit: number;
  @Column() isOnSale: boolean;
  @Column() isArchived: boolean;
}
