import { Controller, Get } from "@nestjs/common";
import { StakingService } from './../services/staking.service';


@Controller()
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Get("/staking")
  getStakingHolders() {
    return this.stakingService.getStakingHolders();
  }
}