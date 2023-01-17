import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'Trait', synchronize: false})
export class Trait {
  @PrimaryColumn() id: number;
  @Column() name: string;
  @Column() layer: string;
  @Column() imageTransparent: string;
}