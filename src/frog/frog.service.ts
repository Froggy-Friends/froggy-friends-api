import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OwnedResponse } from "src/models/OwnedResponse";
import { Repository } from "typeorm";
import { Frog } from "./frog.entity";
import { Params } from 'node_modules/@moralisweb3/evm-api/lib/resolvers/nft/getWalletNFTs';
import * as rarity from '../../rarityBands.json';
import Moralis from 'moralis';
import { ContractService } from "src/contract/contract.service";

@Injectable()
export class FrogService {
  
  constructor(
    @InjectRepository(Frog) private frogRepo: Repository<Frog>,
    private contractService: ContractService
  ) {
    
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
      const stakedTokens: number[] = await this.contractService.staking.methods.deposits(address).call();
      const options: Params = { chain: this.contractService.chain, address: address, tokenAddresses: [this.contractService.froggyAddress] };
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

      const isStakingApproved = await this.contractService.froggy.methods.isApprovedForAll(address, this.contractService.stakingAddress).call();
      const allowance: number = await this.contractService.ribbit.methods.allowance(address, this.contractService.stakingAddress).call();

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
    const options: Params = { chain: this.contractService.chain, address: address, tokenAddresses: [this.contractService.froggyAddress] };
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

    const isStakingApproved = await this.contractService.froggy.methods.isApprovedForAll(address, this.contractService.stakingAddress).call();
    const allowance: number = await this.contractService.ribbit.methods.allowance(address, this.contractService.stakingAddress).call();

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