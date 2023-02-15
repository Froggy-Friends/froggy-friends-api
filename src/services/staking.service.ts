import { EvmChain } from '@moralisweb3/evm-utils';
require('dotenv').config();
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Leaderboard } from "src/models/Leaderboard";
import { formatEther, parseEther, commify, } from "ethers/lib/utils";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import Moralis from 'moralis';
import { ContractService } from 'src/contract/contract.service';
const { ETHERSCAN_API_KEY } = process.env;

@Injectable()
export class StakingService {
  private readonly logger = new Logger(StakingService.name);
  private stakers: string[];
  private leaderboard: Leaderboard[];

  constructor(private contractService: ContractService) {
    this.stakers = [];
    this.leaderboard = [];
  }

  async initLeaderboard() {
    try {
      this.logger.log("Creating new leaderboard");
      this.stakers = await this.processStakers();
      this.leaderboard = await this.processLeaderboard(this.stakers);
      this.logger.log("Leaderboard holders processed: " + this.leaderboard.length);
    } catch (error) {
      this.logger.log("init leaderboard error: " + error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { name: "leaderboard", timeZone: "America/Los_Angeles"})
  async refreshLeaderboard() {
    this.initLeaderboard();
  }

  getStakers() {
    return this.stakers;
  }

  getLeaderboard() {
    return this.leaderboard;
  }

  async getUniqueHolders() {
    let stakerList = [];
    let nonStakerList = [];
    let uniqueStakers = [];
    let uniqueNonStakers = [];
    let uniqueHolders = [];

    // get most recent nft transfer by token id
    for (let tokenId = 0; tokenId < 4444; tokenId++) {
      try {
        const response = await Moralis.EvmApi.nft.getNFTTransfers({
          address: this.contractService.froggyAddress,
          chain: EvmChain.ETHEREUM,
          tokenId: tokenId.toString()
        });

        // latest transfer
        const transfer = response.result[0];

        if (transfer.toAddress.lowercase === this.contractService.stakingAddress.toLowerCase()) {
          // transfer is to staking contract save person who staked
          stakerList.push(transfer.fromAddress.lowercase);
        } else {
          // transfer is to person save new owner who is not staking
          nonStakerList.push(transfer.toAddress.lowercase);
        }

        uniqueStakers = [...new Set(stakerList)];
        uniqueNonStakers = [...new Set(nonStakerList)];
        uniqueHolders = [...new Set(stakerList.concat(nonStakerList))]; 
      } catch (error) {
        console.log(`fetch unique holders error for token ${tokenId}: " error`);
      }
    }
    
    return {
      uniqueStakers: uniqueStakers.length,
      uniqueNonStakers: uniqueNonStakers.length,
      uniqueHolders: uniqueHolders.length
    };
  }

  async processStakers() {
    const froggyFriends = this.contractService.froggyAddress;
    const froggyStaking = this.contractService.stakingAddress;

    let cursor = null;
    let stakers: string[] = [];
    do {
      const response = await Moralis.EvmApi.nft.getNFTContractTransfers({
        address: froggyFriends,
        chain: this.contractService.chain,
        limit: 100,
        cursor: cursor
      });
      console.log(`pagination page ${response.pagination.page} results ${response.result.length}`);

      for (const transfer of response.result) {
        const from = transfer.fromAddress.lowercase;
        const to = transfer.toAddress.lowercase;
        if (to === froggyStaking.toLowerCase() && stakers.includes(from) === false) {
          stakers.push(from);
        }
      }
      cursor = response.pagination.cursor;
    } while (cursor != "" && cursor != null);

    return stakers;
  }

  async processLeaderboard(stakers: string[]): Promise<Leaderboard[]> {
    let leaderboard: Leaderboard[] = [];

    for (const address of stakers) {
      // balances in gwei string format
      const stakingBalanceGwei: string = await this.contractService.staking.methods.balanceOf(address).call();
      const ribbitBalanceGwei: string = await this.contractService.ribbit.methods.balanceOf(address).call();

      // convert balances to ether big number format to perform addition
      const stakingBalanceEther: BigNumber = parseEther(formatEther(stakingBalanceGwei));
      const ribbitBalanceEther: BigNumber = parseEther(formatEther(ribbitBalanceGwei));
      const totalEther: BigNumber = stakingBalanceEther.add(ribbitBalanceEther);

      // convert back to gwei string format 
      const total: string = (formatEther(totalEther));

      if (+total > 300) {
        leaderboard.push({
          account: await this.getENS(address),
          ribbit: total
        });
      }
    }

    return leaderboard.sort((a, b) => +b.ribbit - +a.ribbit).map(s => {
      const total: string = (+s.ribbit).toFixed(2);
      return {
        account: s.account,
        ribbit: commify(total)
      }
    })
  }

  async getENS(address: string) {
    let account = address;
    try {
      const provider = ethers.getDefaultProvider("homestead", { etherscan: ETHERSCAN_API_KEY, alchemy: this.contractService.alchemyUrl});
      const name = await provider.lookupAddress(address);
      if (name) {
        account = name;
      }
    } catch (error) {
      this.logger.error("lookup ENS error: " + error);
    }
    return account;
  }
}