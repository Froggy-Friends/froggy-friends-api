import { TraitLayers } from './../models/TraitLayers';
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OwnedResponse } from "src/models/OwnedResponse";
import { Repository } from "typeorm";
import { Frog } from "./frog.entity";
import { Params } from 'node_modules/@moralisweb3/evm-api/lib/resolvers/nft/getWalletNFTs';
import * as rarity from '../../rarityBands.json';
import Moralis from 'moralis';
import { ContractService } from "src/contract/contract.service";
import { ConfigService } from "@nestjs/config";
import { EvmNft } from "@moralisweb3/evm-utils";
import { TraitService } from "src/traits/trait.service";

@Injectable()
export class FrogService {
  
  constructor(
    @InjectRepository(Frog) private frogRepo: Repository<Frog>,
    private configService: ConfigService,
    private contractService: ContractService,
    private traitService: TraitService
  ) {
    
  }

  async getFrog(id: number): Promise<Frog> {
    return await this.frogRepo.findOneBy({ edition: id });
  }

  formatFrog(frog: Frog): Frog {
    const formattedFrog = {...frog};
    const pinataUrl = this.configService.get<string>('PINATA_URL');
    formattedFrog.cid2d = `${pinataUrl}${frog.cid2d}`;
    formattedFrog.cid3d = `${pinataUrl}${frog.cid3d}`;
    formattedFrog.cidPixel = `${pinataUrl}${frog.cidPixel}`;
    formattedFrog.rarity = this.getFrogRarity(frog.edition);
    formattedFrog.ribbit = this.getFrogRibbit(frog);
    return formattedFrog;
  }

  async saveFrog(frog: Frog): Promise<Frog> {
    return await this.frogRepo.save(frog);
  }

  async getFroggiesOwned(address: string): Promise<OwnedResponse> {
    try {
      const stakedResponse: string[] = await this.contractService.staking.methods.deposits(address).call();
      const options: Params = { chain: this.contractService.chain, address: address, tokenAddresses: [this.contractService.froggyAddress] };
      const unstakedResponse: EvmNft[] = (await Moralis.EvmApi.nft.getWalletNFTs(options)).result;

      const stakedTokens = stakedResponse.map((tokenId: string) => Number(tokenId));
      const unstakedTokens = unstakedResponse.map(token => Number(token.format().tokenId));

      let totalRibbit = 0;
      const froggies: Frog[] = [];

      for (const tokenId of stakedTokens) {
        const frog = await this.getFrog(tokenId);
        // update frog staking status
        if (!frog.isStaked) {
          frog.isStaked = true;
          await this.saveFrog(frog);
        }
        const formattedFrog = this.formatFrog(frog);
        totalRibbit += formattedFrog.ribbit;
        froggies.push(formattedFrog);
      }

      for (const tokenId of unstakedTokens) {
        const frog = await this.getFrog(tokenId);
        // update frog staking status
        if (frog.isStaked) {
          frog.isStaked = false;
          await this.saveFrog(frog);
        }
        const formattedFrog = this.formatFrog(frog);
        froggies.push(formattedFrog);
      }

      froggies.sort((a,b) => a.edition - b.edition);

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
      const formattedFrog = this.formatFrog(frog);
      froggies.push(formattedFrog);
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

  async doesFrogExist(frogId: number, traitId: number): Promise<boolean> {
    const frog = await this.getFrog(frogId);
    const trait = await this.traitService.getTrait(traitId);

    const traits: TraitLayers = {
      Background: frog.background,
      Body: frog.body,
      Eyes: frog.eyes,
      Mouth: frog.mouth,
      Shirt: frog.shirt,
      Hat: frog.hat
    }
    traits[trait.layer] = trait.name;

    const match = await this.frogRepo.findOneBy({
        background: traits.Background,
        body: traits.Body,
        eyes: traits.Eyes,
        mouth: traits.Mouth,
        shirt: traits.Shirt,
        hat: traits.Hat
    });
    return match !== null;
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