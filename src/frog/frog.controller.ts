import { Controller, Get, Param } from "@nestjs/common";
import { OwnedResponse } from "src/models/OwnedResponse";
import { TraitService } from "src/traits/trait.service";
import { Frog } from "./frog.entity";
import { FrogService } from "./frog.service";

@Controller("/frog")
export class FrogController {
  
  constructor(private readonly frogService: FrogService, private readonly traitService: TraitService) {

  }

  @Get('/details/:id')
  async getFrog(@Param('id') id: number): Promise<Frog> {
    const frog = await this.frogService.getFrog(id);
    return this.frogService.formatFrog(frog);
  }

  @Get('/owned/:account')
  async getFroggiesOwned(@Param('account') account: string ): Promise<OwnedResponse> {
    return this.frogService.getFroggiesOwned(account);
  }

  @Get('/owned/unstaked/:account')
  async getUnstakedFroggiesOwned(@Param('account') account: string): Promise<OwnedResponse> {
    return this.frogService.getUnstakedFroggies(account);
  }

  @Get('/preview/:frogId/trait/:traitId')
  async getTraitPreview(@Param('frogId') frogId: number, @Param('traitId') traitId: number) {
    return this.frogService.getTraitPreview(frogId, traitId);
  }

  @Get('/compatible/:frogId/trait/:traitId')
  async isTraitCompatibleWithFrog(@Param('frogId') frogId: number, @Param('traitId') traitId: number) {
    const trait = await this.traitService.getTrait(traitId);
    const compatibleTraits = await this.traitService.getCompatibleTraits(traitId);
    const frog = await this.getFrog(frogId);

    if (trait.layer === "Background") {
      const backgroundTrait = await this.traitService.getTraitByName("Background", frog.background);
      return compatibleTraits.some(trait => trait.id === backgroundTrait.id);
    } else if (trait.layer === "Body") {
      const bodyTrait = await this.traitService.getTraitByName("Body", frog.body);
      return compatibleTraits.some(trait => trait.id === bodyTrait.id);
    } else if (trait.layer === "Eyes") {
      const eyeTrait = await this.traitService.getTraitByName("Eyes", frog.eyes);
      return compatibleTraits.some(trait => trait.id === eyeTrait.id);
    } else if (trait.layer === "Mouth") {
      const mouthTrait = await this.traitService.getTraitByName("Mouth", frog.mouth);
      return compatibleTraits.some(trait => trait.id === mouthTrait.id);
    } else if (trait.layer === "Shirt") {
      const shirtTrait = await this.traitService.getTraitByName("Shirt", frog.shirt);
      return compatibleTraits.some(trait => trait.id === shirtTrait.id);
    } else if (trait.layer === "Hat") {
      const hatTrait = await this.traitService.getTraitByName("Hat", frog.hat);
      return compatibleTraits.some(trait => trait.id === hatTrait.id);
    }

    return false;
  }
}