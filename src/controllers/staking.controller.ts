import { Controller, Get } from "@nestjs/common";
import { Leaderboard } from "src/models/Leaderboard";
import { StakingService } from './../services/staking.service';


@Controller()
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Get("/staking")
  getStakingHolders() {
    return this.stakingService.getStakingHolders();
  }

  @Get("/leaderboard")
  async getLeaderboard(page: number): Promise<Leaderboard[]> {
    const stakers = await this.stakingService.getStakingHoldersAllTime();
    return await this.stakingService.getLeaderboard(stakers);
  }
}