import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trait } from './trait.entity';

@Injectable()
export class TraitService {
  constructor(
    @InjectRepository(Trait) private traitRepo: Repository<Trait>,
    private readonly configService: ConfigService,
  ) {}

  async getTrait(id: number): Promise<Trait> {
    return await this.traitRepo.findOneBy({ id: id });
  }

  async save(trait: Trait) {
    return await this.traitRepo.save(trait);
  }

  async getCount(): Promise<number> {
    return await this.traitRepo.count();
  }

  async getAllTraits(): Promise<Trait[]> {
    const [traits] = await this.traitRepo.findAndCount();
    return traits.sort((a, b) => a.id - b.id);
  }

  async getOriginalTraits(): Promise<Trait[]> {
    return await this.traitRepo.findBy({ origin: 'original' });
  }

  async getTraitsByLayer(layer: string): Promise<Trait[]> {
    return await this.traitRepo.findBy({ layer: layer });
  }

  async getTraitByName(layer: string, name: string): Promise<Trait> {
    return await this.traitRepo.findOneBy({ layer: layer, name: name });
  }

  /**
   * @description get all traits that a trait is compatible with in the rules table: traitId -> compatibleTraidId
   * @param traitId
   * @returns array of traits matching compatibleTraitId in rules table
   * @example
   * Rules table
   * [id, traitId, compatibleTraitId]
   * [1, 2, 10]
   * [2, 2, 11]
   * param is 2
   * returns traits matching ids [10, 11]
   */

  async getCompatibleTraitsForTraitId(traitId: number): Promise<Trait[]> {
    const schema = this.configService.get('ENVIRONMENT') === 'production' ? 'public' : 'development';
    const query = `select trait.id, trait.name, trait.layer, trait."imageTransparent", trait.origin from ${schema}."Trait" trait inner join ${schema}."Rule" r on r."compatibleTraitId" = trait.id where r."traitId" = ${traitId};`;
    return await this.traitRepo.query(query);
  }

  /**
   * @description get all traits that a compatible trait derives from in the rules table: traitId <- compatibleTraitId
   * @param compatibleTraitId
   * @returns array of traits matching traitId in the rules table
   * @example
   * Rules table
   * [id, traitId, compatibleTraitId]
   * [1, 5, 10]
   * [2, 6, 10]
   * param is 10
   * returns traits matching ids [5,6]
   */
  async getTraitsForCompatibleTraitId(
    compatibleTraitId: number,
  ): Promise<Trait[]> {
    const schema = this.configService.get('ENVIRONMENT') === 'production' ? 'public' : 'development';
    const query = `select trait.id, trait.name, trait.layer, trait."imageTransparent", trait.origin from ${schema}."Trait" trait inner join ${schema}."Rule" r on r."traitId" = trait.id where r."compatibleTraitId" = ${compatibleTraitId};`;
    return await this.traitRepo.query(query);
  }
}
