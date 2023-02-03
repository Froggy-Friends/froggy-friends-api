import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'Rule', synchronize: false})
export class Rule {
  @PrimaryColumn() id: number;
  @Column() traitId: number;
  @Column() compatibleTraitId: number;
}