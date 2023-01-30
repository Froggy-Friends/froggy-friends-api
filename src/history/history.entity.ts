import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'History', synchronize: false})
export class History {
  @PrimaryColumn() id: number;
  @Column() wallet: string;
  @Column() frogId: number;
  @Column() friendId: number;
  @Column() traitId: number;
  @Column() date: string;
  @Column() isPairing: boolean;
  @Column() isUnpairing: boolean;
  @Column() isStaking: boolean;
  @Column() isUnstaking: boolean;
  @Column() isTraitUpgrade: boolean;
  @Column() pairTx: string;
  @Column() unpairTx: string;
  @Column() stakeTx: string;
  @Column() unstakeTx: string;
  @Column() upgradeTx: string;
}