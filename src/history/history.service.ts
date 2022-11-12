import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HistoryEvent } from "src/models/HistoryEvent";
import { HistoryTx } from "src/models/HistoryTx";
import { Repository } from "typeorm";
import { History } from "./history.entity";

@Injectable()
export class HistoryService {
  
  constructor(@InjectRepository(History) private historyRepo: Repository<History>) {

  }

  findHistory(wallet: string): Promise<History[]> {
   return this.historyRepo.find({ where: { wallet: wallet}});
  }

  async saveHistory(
    account: string,
    frogId: number,
    friendId: number,
    historyEvent: HistoryEvent,
    historyTx: HistoryTx
  ): Promise<History> {
    const history = new History();
    history.wallet = account;
    history.isPairing = historyEvent.isPairing;
    history.isUnpairing = historyEvent.isUnpairing;
    history.isStaking = historyEvent.isStaking;
    history.isUnstaking = historyEvent.isUnstaking;
    history.date = (new Date()).toUTCString();
    history.friendId = friendId;
    history.frogId = frogId;
    history.pairTx = historyTx.pairTx;
    history.unpairTx = historyTx.unpairTx;
    history.stakeTx = historyTx.stakeTx;
    history.unstakeTx = historyTx.unstakeTx;
    return await this.historyRepo.save(history);
  }

  
}