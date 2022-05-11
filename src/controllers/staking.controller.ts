import { Controller, Get } from "@nestjs/common";
import { StakingService } from './../services/staking.service';


@Controller()
export class StakingController {
  constructor(private readonly moralisService: StakingService) {}

  @Get("/staking")
  getStakingHolders() {
    return this.moralisService.getStakingHolders();
  }
}