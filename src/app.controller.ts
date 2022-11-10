import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { OwnedNft } from 'alchemy-sdk';
import { AppService } from './app.service';
import { Froggy } from './models/Froggy';
import { OwnedNftsRequest } from './models/OwnedNftsRequest';
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

  @Get('/owned/:account')
  async getFroggiesOwned(@Param('account') account: string ): Promise<OwnedResponse> {
    return this.appService.getFroggiesOwned(account);
  }

  @Get('/owned/friends/:account')
  async getFriendsOwned(@Param('account') account: string) {
    return this.appService.getFriendsOwned(account);
  }

  @Post('/owned/nfts')
  async getNFTsOwned(@Body() ownedNftsRequest: OwnedNftsRequest): Promise<OwnedNft[]> {
    return this.appService.getNftsOwned(ownedNftsRequest.account, ownedNftsRequest.contract);
  }

  @Get('/frog/:id')
  async getFrog(@Param('id') id: number): Promise<Froggy> {
    return this.appService.getFroggy(id);
  }

  @Post('/stake')
  getStakeProof(@Body() tokenIds: number[]): string[] {
    return this.appService.getStakeProof(tokenIds);
  }
}
