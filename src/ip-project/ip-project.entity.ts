import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'IpProject', synchronize: false })
export class IpProject {
  @PrimaryGeneratedColumn() id: number;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column() email: string;
  @Column() name: string;
  @Column() description: string;
  @Column() goal: string;
  @Column() apply: boolean;
}
