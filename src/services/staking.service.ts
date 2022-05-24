require('dotenv').config();
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Leaderboard } from "src/models/Leaderboard";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import * as stakingAbi from '../abi-staking.json';
import * as ribbitAbi from '../abi-ribbit.json';
import { formatEther, parseEther, commify, } from "ethers/lib/utils";
import { BigNumber } from "@ethersproject/bignumber";
const { ALCHEMY_API_URL, STAKING_CONTRACT_ADDRESS, RIBBIT_CONTRACT_ADDRESS } = process.env;
const Moralis = require("moralis/node");
const web3 = createAlchemyWeb3(ALCHEMY_API_URL);
const stakingAbiItem: any = stakingAbi;
const ribbitAbiItem: any = ribbitAbi;
const stakingContract = new web3.eth.Contract(stakingAbiItem, STAKING_CONTRACT_ADDRESS);
const ribbitContract = new web3.eth.Contract(ribbitAbiItem, RIBBIT_CONTRACT_ADDRESS);

@Injectable()
export class StakingService {
  private readonly logger = new Logger(StakingService.name);
  leaderboard: Leaderboard[];

  constructor() {
    this.leaderboard = [];
  }

  // @Cron(CronExpression.EVERY_MINUTE, { name: "leaderboard", timeZone: "America/Los_Angeles"})
  // async processLeaderboard() {
  //   this.logger.log("Processing leaderboard: ", new Date());
  //   const stakers = await this.getStakingHoldersAllTime();
  //   const leaderboard = await this.getLeaderboard(stakers);
  //   this.leaderboard = leaderboard;
  // }

  async getStakingHolders(): Promise<string[]> {
    const StakingTransfers = Moralis.Object.extend("EthNFTTransfers");
    const query = new Moralis.Query(StakingTransfers);
    const staking = [
      { match: { to_address: "0x8f7b5f7845224349ae9ae45b400ebae0051fcd9d", confirmed: true}},
      { sort: { block_number: 1}}
    ];
    const stakingResults = await query.aggregate(staking);
    
    const unstaking = [
      { match: { from_address: "0x8f7b5f7845224349ae9ae45b400ebae0051fcd9d", confirmed: true}},
      { sort: { block_number: 1}}
    ];
    const unstakingResults = await query.aggregate(unstaking);

    const filteredStakers = [...stakingResults];

    for (const unstaked of unstakingResults) {
      // find matching staking transaction
      const matchIndex = filteredStakers.findIndex(stake => stake.token_id === unstaked.token_id && stake.from_address === unstaked.to_address);

      if (matchIndex > -1) {
        filteredStakers.splice(matchIndex, 1);
      }
    }

    const owners = filteredStakers.map(s => s.from_address);
    return [...new Set(owners)];
  }

  async getStakingHoldersAllTime(): Promise<string[]> {
    const StakingTransfers = Moralis.Object.extend("EthNFTTransfers");
    const query = new Moralis.Query(StakingTransfers);
    const staking = [
      { match: { to_address: "0x8f7b5f7845224349ae9ae45b400ebae0051fcd9d", confirmed: true}},
      { sort: { block_number: 1}}
    ];
    const stakingResults = await query.aggregate(staking);
    const filteredStakers = [...stakingResults];
    const owners = filteredStakers.map(s => s.from_address);
    return [...new Set(owners)];
  }

  async getLeaderboard(stakers: string[]): Promise<Leaderboard[]> {
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
      const totalFormatted: string = (+total).toFixed(2);

      leaderboard.push({
        account: address,
        ribbit: total,
        ribbitFormatted: commify(totalFormatted)
      });
    }

    return leaderboard.sort((a, b) => +b.ribbit - +a.ribbit);
  }
}