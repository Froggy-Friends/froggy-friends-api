import { Controller, Get } from "@nestjs/common";
import { MoralisService } from './../services/moralis.service';


@Controller()
export class MoralisController {
  constructor(private readonly moralisService: MoralisService) {}

  @Get("/staking")
  getStakingHolders() {
    return this.moralisService.getStakingHolders();
  }
}