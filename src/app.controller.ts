import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ribbit/:account')
  async getRibbitTokens(@Param('account') account: string): Promise<number> {
    return this.appService.getAccountTokens(account);
  }

  @Get('/ribbit/staked/:account')
  async getRibbitTokensStaked(
    @Param('account') account: string,
  ): Promise<number> {
    return this.appService.getAccountTokensStaked(account);
  }
}
