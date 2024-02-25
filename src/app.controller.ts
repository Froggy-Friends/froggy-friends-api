import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { OwnedNft } from 'alchemy-sdk';
import { AppService } from './app.service';
import { OwnedNftsRequest } from './models/OwnedNftsRequest';
import { ProofRequest } from './models/ProofRequest';
import { ProofResponse } from './models/ProofResponse';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

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

  @Get('/owned/friends/:account')
  async getFriendsOwned(@Param('account') account: string) {
    return this.appService.getFriendsOwned(account);
  }

  @Post('/owned/nfts')
  async getNFTsOwned(@Body() ownedNftsRequest: OwnedNftsRequest): Promise<OwnedNft[]> {
    return this.appService.getNftsOwned(ownedNftsRequest.account, ownedNftsRequest.contract);
  }

  @Post('/stake')
  getStakeProof(@Body() tokenIds: number[]): string[] {
    return this.appService.getStakeProof(tokenIds);
  }

  @Get('/ribbit/:account')
  async getRibbitTokens(@Param('account') account: string): Promise<number> {
    return this.appService.getAccountTokens(account);
  }

  @Get('/ribbit/staked/:account')
  async getRibbitTokensStaked(@Param('account') account: string): Promise<number> {
    return this.appService.getAccountTokensStaked(account);
  }
}
