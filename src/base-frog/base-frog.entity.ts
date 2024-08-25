import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'BaseFrog', synchronize: false })
export class BaseFrog {
  @PrimaryColumn() edition: number;
  @Column() name: string;
  @Column() description: string;
  @Column() background: string;
  @Column() body: string;
  @Column() eyes: string;
  @Column() mouth: string;
  @Column() shirt: string;
  @Column() hat: string;
  @Column() image: string;
}
