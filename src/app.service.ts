import { formatEther } from 'ethers/lib/utils';
import { Injectable } from '@nestjs/common';
import { ContractService } from './contract/contract.service';

@Injectable()
export class AppService {
  constructor(private readonly contractService: ContractService) {}

  async getAccountTokens(account: string): Promise<number> {
    const ribbitBalanceGwei: string = await this.contractService.ribbit.methods
      .balanceOf(account)
      .call();
    const format = formatEther(ribbitBalanceGwei);
    const balance = Number(format).toFixed(2);
    return +balance;
  }

  async getAccountTokensStaked(account: string): Promise<number> {
    const stakingBalanceGwei: string =
      await this.contractService.staking.methods.balanceOf(account).call();
    const format = formatEther(stakingBalanceGwei);
    const balance = Number(format).toFixed(2);
    return +balance;
  }
}
