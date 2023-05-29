import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Frog } from "src/frog/frog.entity";
import { FrogService } from "src/frog/frog.service";
import { TraitLayers } from "src/models/TraitLayers";
import { Trait } from "src/traits/trait.entity";
import { TraitService } from "src/traits/trait.service";
import { Repository } from "typeorm";
import { Upgrade } from "./upgrade.entity";

@Injectable()
export class UpgradeService {
  
  constructor(
    @InjectRepository(Upgrade) private upgradeRepo: Repository<Upgrade>,
    private readonly frogService: FrogService,
    private readonly traitService: TraitService
  ) {

  }

  getAllUpgrades() {
    return this.upgradeRepo.find();
  }

  getUpgradesForFrog(frogId: number) {
    return this.upgradeRepo.findBy({ frogId: frogId });
  }

  getPendingUpgrades() {
    return this.upgradeRepo.findBy({ isPending: true });
  }

  async doesUpgradeExist(frogId: number, traitId: number): Promise<boolean> {
    const frog = await this.frogService.getFrog(frogId);
    const trait = await this.traitService.getTrait(traitId);

    const traits: TraitLayers = {
      Background: frog.background,
      Body: frog.body,
      Eyes: frog.eyes,
      Mouth: frog.mouth,
      Shirt: frog.shirt,
      Hat: frog.hat
    }
    traits[trait.layer] = trait.name;

    const upgrade = await this.upgradeRepo.findOneBy({
      background: traits.Background,
      body: traits.Body,
      eyes: traits.Eyes,
      mouth: traits.Mouth,
      shirt: traits.Shirt,
      hat: traits.Hat
    });

    return upgrade !== null;
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

    if (trait.layer === "Background") {
      upgrade.background = trait.name;
    } else if (trait.layer === "Body") {
      upgrade.body = trait.name;
    } else if (trait.layer === "Eyes") {
      upgrade.eyes = trait.name;
    } else if (trait.layer === "Mouth") {
      upgrade.mouth = trait.name;
    } else if (trait.layer === "Shirt") {
      upgrade.shirt = trait.name;
    } else if (trait.layer === "Hat") {
      upgrade.hat = trait.name;
    } 

    return await this.upgradeRepo.save(upgrade);
  }
  
}