import { HistoryService } from './history.service';
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request } from "@nestjs/common";
import { History } from './history.entity';
import { TraitUpgradeRequest } from 'src/models/TraitUpgradeRequest';
import { ContractService } from 'src/contract/contract.service';
import { isTraitUpgradeAuthenticated } from 'src/auth';

@Controller('history')
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService, 
    private readonly contractService: ContractService
  ) {

  }

  @Get('/:account')
  async getAccountHistory(@Param('account') account: string): Promise<History[]> {
    return this.historyService.findHistory(account);
  }

  @Get('/traits/:account')
  async getTraitUpgradeHistory(@Param('account') account: string): Promise<History[]> {
    return this.historyService.findTraitUpgradeHistory(account);
  }

  @Post('/traits')
  async saveTraitUpgradeHistory(@Body() request: TraitUpgradeRequest) {
    try {
      // confirm account owns frog
      const owner = await this.contractService.getFrogOwner(request.frogId);
      isTraitUpgradeAuthenticated(request, owner);
      return await this.historyService.saveTraitUpgradeHistory(request.account, request.frogId, request.traitId, request.transaction);
    } catch (error) {
      console.log("error: ", error);
      throw new HttpException("Error saving trait upgrade history", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}