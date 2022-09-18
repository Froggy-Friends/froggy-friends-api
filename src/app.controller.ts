import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Froggy } from './models/Froggy';
import { FrogRequest } from './models/FrogRequest';
import { OwnedRequest } from './models/OwnedRequest';
import { OwnedResponse } from './models/OwnedResponse';
import { ProofRequest } from './models/ProofRequest';
import { ProofResponse } from './models/ProofResponse';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHome() {
    return "Froggy Friends API";
  }

  @Post('/proof')
  getProof(@Body() proofRequest: ProofRequest): ProofResponse {
    return {
      proof: this.appService.getProof(proofRequest.wallet)
    }
  }

  @Post('/check')
  async getIsOnFroggylist(@Body() proofRequest: ProofRequest): Promise<boolean> {
    return this.appService.getIsOnFroggylist(proofRequest.wallet);
  }

  @Post('/owned')
  async getFroggiesOwned(@Body() ownedRequest: OwnedRequest): Promise<OwnedResponse> {
    return this.appService.getFroggiesOwned(ownedRequest.account);
  }

  @Post('/frog/:id')
  async getFrog(@Param('id') id: number): Promise<Froggy> {
    return this.appService.getFroggy(id);
  }

  @Post('/stake')
  getStakeProof(@Body() tokenIds: number[]): string[] {
    return this.appService.getStakeProof(tokenIds);
  }
}
