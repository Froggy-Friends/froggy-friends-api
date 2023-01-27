import { HistoryService } from './history.service';
import { Controller, Get, Param } from "@nestjs/common";
import { History } from './history.entity';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {

  }

  @Get('/:account')
  async getAccountHistory(@Param('account') account: string): Promise<History[]> {
    return this.historyService.findHistory(account);
  }

  @Get('/traits/:account')
  async getTraitUpgradeHistory(@Param('account') account: string): Promise<History[]> {
    return this.historyService.findTraitUpgradeHistory(account);
  }
}