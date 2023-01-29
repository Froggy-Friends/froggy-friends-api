import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Frog } from "src/frog/frog.entity";
import { TraitLayers } from "src/models/TraitLayers";
import { Trait } from "src/traits/trait.entity";
import { Repository } from "typeorm";
import { Upgrade } from "./upgrade.entity";

@Injectable()
export class UpgradeService {
  
  constructor(@InjectRepository(Upgrade) private upgradeRepo: Repository<Upgrade>) {

  }

  async isUpgradeTaken(traits: TraitLayers) {
    const upgrade = await this.upgradeRepo.findOneBy({
      background: traits.Background,
      body: traits.Body,
      eyes: traits.Eyes,
      mouth: traits.Mouth,
      shirt: traits.Shirt,
      hat: traits.Hat
    });

    return upgrade ? (upgrade.isPending || upgrade.isComplete) : false;
  }

  async savePending(account: string, frog: Frog, trait: Trait, transaction: string): Promise<Upgrade> {
    const count = await this.upgradeRepo.count();
    const upgrade = new Upgrade();
    upgrade.id = count + 1;
    upgrade.wallet = account;
    upgrade.frogId = frog.edition;
    upgrade.traitId = trait.id;
    upgrade.traitName = trait.name;
    upgrade.traitLayer = trait.layer;
    upgrade.date = (new Date()).toUTCString();
    upgrade.background = frog.background;
    upgrade.body = frog.body;
    upgrade.eyes = frog.eyes;
    upgrade.mouth = frog.mouth;
    upgrade.shirt = frog.shirt;
    upgrade.hat = frog.hat;
    upgrade.isPending = true;
    upgrade.isFailed = false;
    upgrade.isComplete = false;
    upgrade.transaction = transaction;
    return await this.upgradeRepo.save(upgrade);
  }
  
}