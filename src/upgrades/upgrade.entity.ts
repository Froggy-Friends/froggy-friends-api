import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Upgrades', synchronize: false })
export class Upgrade {
  @PrimaryColumn() id: number;
  @Column() wallet: string;
  @Column() frogId: number;
  @Column() traitId: number;
  @Column() traitName: string;
  @Column() traitLayer: string;
  @Column() date: string;
  @Column() background: string;
  @Column() body: string;
  @Column() eyes: string;
  @Column() mouth: string;
  @Column() shirt: string;
  @Column() hat: string;
  @Column() isPending: boolean;
  @Column() isFailed: boolean;
  @Column() isComplete: boolean;
  @Column() transaction: string;
}
