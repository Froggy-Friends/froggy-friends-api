import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Trait } from "./trait.entity";

@Injectable()
export class TraitService {
  constructor(@InjectRepository(Trait) private traitRepo: Repository<Trait>) {}

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
    return traits.sort((a,b) => a.id - b.id);
  }

  async getOriginalTraits(): Promise<Trait[]> {
    return await this.traitRepo.findBy({origin: 'original'});
  }

  async getTraitsByLayer(layer: string): Promise<Trait[]> {
    return await this.traitRepo.findBy({layer: layer});
  }

  async getCompatibleTraits(traitId: number) {
    const query = `select trait.id, trait.name, trait.layer, trait."imageTransparent", trait.origin from development."Trait" trait inner join development."Rule" r on r."compatibleTraitId" = trait.id where r."traitId" = ${traitId};`;
    const traits = await this.traitRepo.query(query);
    return traits;
  }
}