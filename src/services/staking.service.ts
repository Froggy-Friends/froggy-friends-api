import { EvmChain } from '@moralisweb3/evm-utils';
require('dotenv').config();
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Leaderboard } from "src/models/Leaderboard";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import * as froggyAbi from '../abi.json';
import * as stakingAbi from '../abi-staking.json';
import * as ribbitAbi from '../abi-ribbit.json';
import { formatEther, parseEther, commify, } from "ethers/lib/utils";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import Moralis from 'moralis';
const { ALCHEMY_API_URL, CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, RIBBIT_CONTRACT_ADDRESS, ETHERSCAN_API_KEY, NODE_ENV } = process.env;
const web3 = createAlchemyWeb3(ALCHEMY_API_URL);
const froggyAbiItem: any = froggyAbi;
const stakingAbiItem: any = stakingAbi;
const ribbitAbiItem: any = ribbitAbi;
const froggyContract = new web3.eth.Contract(froggyAbiItem, CONTRACT_ADDRESS);
const stakingContract = new web3.eth.Contract(stakingAbiItem, STAKING_CONTRACT_ADDRESS);
const ribbitContract = new web3.eth.Contract(ribbitAbiItem, RIBBIT_CONTRACT_ADDRESS);

@Injectable()
export class StakingService {
  private readonly logger = new Logger(StakingService.name);
  private stakers: string[];
  private leaderboard: Leaderboard[];
  private chain: EvmChain;

  constructor() {
    this.chain = NODE_ENV === "production" ? EvmChain.ETHEREUM : EvmChain.GOERLI;
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
      console.log("init leaderboard error: ", error);
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

  async processStakers(): Promise<string[]> {
    const address = CONTRACT_ADDRESS.toLowerCase();
    const stakingAddress = STAKING_CONTRACT_ADDRESS.toLowerCase();
    let transfers = await Moralis.EvmApi.nft.getNFTContractTransfers({address: address, chain: this.chain})
    let stakers = [
      ...transfers.result.filter(tx => tx.toAddress.lowercase === stakingAddress).map(tx => tx.fromAddress.lowercase)
    ];

    while (transfers.hasNext()) {
      stakers.push(
        ...transfers.result.filter(tx => tx.toAddress.lowercase === stakingAddress).map(tx => tx.fromAddress.lowercase)
      );
      transfers = await transfers.next();
    }

    return [...new Set(stakers)];
  }

  async processLeaderboard(stakers: string[]): Promise<Leaderboard[]> {
    let leaderboard: Leaderboard[] = [];

    for (const address of stakers) {
      // balances in gwei string format
      const stakingBalanceGwei: string = await stakingContract.methods.balanceOf(address).call();
      const ribbitBalanceGwei: string = await ribbitContract.methods.balanceOf(address).call();

      // convert balances to ether big number format to perform addition
      const stakingBalanceEther: BigNumber = parseEther(formatEther(stakingBalanceGwei));
      const ribbitBalanceEther: BigNumber = parseEther(formatEther(ribbitBalanceGwei));
      const totalEther: BigNumber = stakingBalanceEther.add(ribbitBalanceEther);

      // convert back to gwei string format 
      const total: string = (formatEther(totalEther));

      if (+total > 0) {
        let account = address;
        try {
          const provider = ethers.getDefaultProvider("homestead", { etherscan: ETHERSCAN_API_KEY, alchemy: ALCHEMY_API_URL});
          const name = await provider.lookupAddress(address);
          if (name) {
            account = name;
          }
        } catch (error) {
          this.logger.error("lookup ENS error: " + error);
        }

        const tokensStaked: number[] = await stakingContract.methods.deposits(address).call();
        const tokensUnstaked: number = await froggyContract.methods.balanceOf(address).call();
        let tokenCount = tokensUnstaked;
        tokensStaked.forEach(t => tokenCount++);

        leaderboard.push({
          account: account,
          ribbit: total,
          frogs: tokenCount
        });
      }
    }

    return leaderboard.sort((a, b) => +b.ribbit - +a.ribbit).map(s => {
      const total: string = (+s.ribbit).toFixed(2);
      return {
        account: s.account,
        ribbit: commify(total),
        frogs: s.frogs
      }
    })
  }
}