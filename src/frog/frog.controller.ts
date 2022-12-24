import { Controller, Get, Param } from "@nestjs/common";
import { OwnedResponse } from "src/models/OwnedResponse";
import { Frog } from "./frog.entity";
import { FrogService } from "./frog.service";

@Controller("/frog")
export class FrogController {
  
  constructor(private readonly frogService: FrogService) {

  }

  @Get('/:id')
  async getFrog(@Param('id') id: number): Promise<Frog> {
    return this.frogService.getFrog(id);
  }

  @Get('/owned/:account')
  async getFroggiesOwned(@Param('account') account: string ): Promise<OwnedResponse> {
    return this.frogService.getFroggiesOwned(account);
  }

  @Get('/owned/unstaked/:account')
  async getUnstakedFroggiesOwned(@Param('account') account: string): Promise<OwnedResponse> {
    return this.frogService.getUnstakedFroggies(account);
  }
}