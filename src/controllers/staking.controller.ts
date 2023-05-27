import { Body, Controller, Get, Post } from "@nestjs/common";
import { Leaderboard } from "src/models/Leaderboard";
import { StakingService } from './../services/staking.service';


@Controller()
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Get("/staking")
  getStakingHolders() {
    return this.stakingService.getStakers();
  }

  @Get("/leaderboard")
  getLeaderboard() {
    return this.stakingService.getLeaderboard();
  }

  @Get('/unique/holders')
  getUniqueHolders() {
    return this.stakingService.getUniqueHolders();
  }

  @Get('/og/holders')
  getOgHoldersSinceMint() {
    return this.stakingService.getHoldersSinceMint();
  }

  @Post('/og/holders/unique')
  getUniqueOgHolders(@Body() holders: string[]) {
    const unique = new Set(holders);
    console.log("total unique holders: ", unique.size);
    return Array.from(unique);
  }
}