import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'Frog', synchronize: false})
export class Frog {
  @PrimaryColumn() edition: number;
  @Column() name: string;
  @Column() description: string;
  @Column() date: string;
  @Column() oneOfOne: string;
  @Column() background: string;
  @Column() body: string;
  @Column() eyes: string;
  @Column() mouth: string;
  @Column() shirt: string;
  @Column() hat: string;
  @Column() friendId: number;
  @Column() friendName: string;
  @Column() friendBoost: number;
  @Column() cid2d: string;
  @Column() cid3d: string;
  @Column() cidPixel: string;
  @Column() cidCarousel: string;
  @Column() isStaked: boolean;
  @Column() isPaired: boolean;
  @Column() isUpgraded: boolean;
  @Column() isOneOfOne: boolean;
  @Column() pairTx: string;
  @Column() unpairTx: string;
  ribbit: number;
  rarity: string;
}