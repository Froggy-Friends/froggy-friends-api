import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OwnedResponse } from "src/models/OwnedResponse";
import { Repository } from "typeorm";
import { Frog } from "./frog.entity";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import { EvmChain } from '@moralisweb3/evm-utils';
import { Params } from 'node_modules/@moralisweb3/evm-api/lib/resolvers/nft/getWalletNFTs';
import * as frogAbi from '../abi.json';
import * as stakingAbi from '../abi-staking.json';
import * as ribbitAbi from '../abi-ribbit.json';
import * as rarity from '../../rarityBands.json';
import Moralis from 'moralis';
require('dotenv').config();
const { ALCHEMY_API_URL, CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, RIBBIT_CONTRACT_ADDRESS } = process.env;
const web3 = createAlchemyWeb3(ALCHEMY_API_URL);
const stakingAbiItem: any = stakingAbi;
const ribbitAbiItem: any = ribbitAbi;
const frogAbiItem: any = frogAbi;
const frogContract = new web3.eth.Contract(frogAbiItem, CONTRACT_ADDRESS);
const stakingContract = new web3.eth.Contract(stakingAbiItem, STAKING_CONTRACT_ADDRESS);
const ribbitContract = new web3.eth.Contract(ribbitAbiItem, RIBBIT_CONTRACT_ADDRESS);

@Injectable()
export class FrogService {
  chain: EvmChain;
  
  constructor(@InjectRepository(Frog) private frogRepo: Repository<Frog>) {
    this.chain = process.env.NODE_ENV === "production" ? EvmChain.ETHEREUM : EvmChain.GOERLI;
  }

  async getFrog(id: number): Promise<Frog> {
    const frog = await this.frogRepo.findOneBy({ edition: id });
    frog.cid2d = `https://froggyfriends.mypinata.cloud/ipfs/${frog.cid2d}`;
    frog.cid3d = `https://froggyfriends.mypinata.cloud/ipfs/${frog.cid3d}`;
    frog.cidPixel = `https://froggyfriends.mypinata.cloud/ipfs/${frog.cidPixel}`;
    frog.rarity = this.getFrogRarity(frog.edition);
    frog.ribbit = this.getFrogRibbit(frog);
    return frog;
  }

  async saveFrog(frog: Frog): Promise<Frog> {
    return await this.frogRepo.save(frog);
  }

  async getFroggiesOwned(address: string): Promise<OwnedResponse> {
    try {
      const stakedTokens: number[] = await stakingContract.methods.deposits(address).call();
      const options: Params = { chain: this.chain, address: address, tokenAddresses: [CONTRACT_ADDRESS] };
      const unstakedTokens = (await Moralis.EvmApi.nft.getWalletNFTs(options)).result;

      let totalRibbit = 0;
      const froggies: Frog[] = [];
      let tokens: number[] = [
        ...stakedTokens.map(t => Number(t)), 
        ...unstakedTokens.map(t => Number(t.format().tokenId))
      ];
      tokens.sort();

      for (const tokenId of tokens) {
        const frog = await this.getFrog(tokenId);
        if (frog.isStaked) {
          totalRibbit += frog.ribbit;
        }
        froggies.push(frog);
      }

      const isStakingApproved = await frogContract.methods.isApprovedForAll(address, STAKING_CONTRACT_ADDRESS).call();
      const allowance: number = await ribbitContract.methods.allowance(address, STAKING_CONTRACT_ADDRESS).call();

      return {
        froggies: froggies,
        totalRibbit: totalRibbit,
        allowance: +allowance,
        isStakingApproved: isStakingApproved
      };
    } catch (error) {
      console.log("Get Froggies Owned Error: ", error);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  async getUnstakedFroggies(address: string): Promise<OwnedResponse> {
    const options: Params = { chain: this.chain, address: address, tokenAddresses: [CONTRACT_ADDRESS] };
    const unstakedTokens = (await Moralis.EvmApi.nft.getWalletNFTs(options)).result;
    let totalRibbit = 0;
    const froggies: Frog[] = [];
    let tokens: number[] = [
      ...unstakedTokens.map(t => Number(t.format().tokenId))
    ];
    tokens.sort();
    for (const tokenId of tokens) {
      const frog = await this.getFrog(tokenId);
      froggies.push(frog);
    }

    const isStakingApproved = await frogContract.methods.isApprovedForAll(address, STAKING_CONTRACT_ADDRESS).call();
    const allowance: number = await ribbitContract.methods.allowance(address, STAKING_CONTRACT_ADDRESS).call();

    return {
      froggies: froggies,
      totalRibbit: totalRibbit,
      allowance: +allowance,
      isStakingApproved: isStakingApproved
    };
  }

  private getFrogRarity(frogId: number): string {
    if (rarity.common.includes(frogId)) {
      return "Common";
    } else if (rarity.uncommon.includes(frogId)) {
      return "Uncommon";
    } else if (rarity.rare.includes(frogId)) {
      return "Rare";
    } else if (rarity.legendary.includes(frogId)) {
      return "Legendary";
    } else if (rarity.epic.includes(frogId)) {
      return "Epic";
    } else {
      return "Common";
    }
  }

  private getFrogRibbit(frog: Frog): number {
    let ribbit = 20;
    if (rarity.common.includes(frog.edition)) {
      ribbit = 20;
    } else if (rarity.uncommon.includes(frog.edition)) {
      ribbit = 30;
    } else if (rarity.rare.includes(frog.edition)) {
      ribbit = 40;
    } else if (rarity.legendary.includes(frog.edition)) {
      ribbit = 75;
    } else if (rarity.epic.includes(frog.edition)) {
      ribbit = 150;
    }

    if (frog.isPaired && frog.friendBoost) {
      ribbit = frog.friendBoost / 100 * ribbit + ribbit;
    }
    return ribbit;
  }
}