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

  async getAllTraits(): Promise<Trait[]> {
    const [traits] = await this.traitRepo.findAndCount();
    return traits.sort((a,b) => a.id - b.id);
  }

  async getOriginalTraits(): Promise<Trait[]> {
    return await this.traitRepo.findBy({origin: 'original'});
  }
}