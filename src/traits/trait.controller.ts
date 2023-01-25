import { Controller, Get, Param } from "@nestjs/common";
import { TraitService } from "./trait.service";
import { Trait } from "./trait.entity";

@Controller('/traits')
export class TraitController {

  constructor(private readonly traitService: TraitService) {}

  @Get()
  async getAllTraits() {
    return this.traitService.getAllTraits();
  }

  @Get('/original')
  async getOriginalTraits() {
    return this.traitService.getOriginalTraits();
  }

  @Get('/layer/:layer')
  async getTraitsByLayer(@Param('layer') layer: string) {
    return this.traitService.getTraitsByLayer(layer);
  }

  @Get('/compatible/:traitId')
  async getCompatibleTraits(@Param('traitId') traitId: number): Promise<Trait[]> {
    return this.traitService.getCompatibleTraitsForTraitId(traitId);
  }

}