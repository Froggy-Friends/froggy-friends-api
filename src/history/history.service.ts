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

  findPairingHistory(wallet: string): Promise<History[]> {
   return this.historyRepo.find({ where: { wallet: wallet, isPairing: true}});
  }

  findTraitUpgradeHistory(wallet: string): Promise<History[]> {
    return this.historyRepo.find({ where: { wallet: wallet, isTraitUpgrade: true }});
  }

  async saveTraitUpgradeHistory(account: string, frogId: number, traitId: number, transaction: string): Promise<History> {
    const count = await this.historyRepo.count();
    const history = new History();
    history.id = count + 1;
    history.wallet = account;
    history.isPairing = false;
    history.isUnpairing = false;
    history.isStaking = false;
    history.isUnstaking = false;
    history.isTraitUpgrade = true;
    history.date = (new Date()).toUTCString();
    history.friendId = undefined;
    history.frogId = frogId;
    history.traitId = traitId;
    history.pairTx = undefined;
    history.unpairTx = undefined;
    history.stakeTx = undefined;
    history.unstakeTx = undefined;
    history.upgradeTx = transaction;
    return await this.historyRepo.save(history);
  }
  
}