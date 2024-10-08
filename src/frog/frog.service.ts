import { TraitLayers } from './../models/TraitLayers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Frog } from './frog.entity';
import * as rarity from '../../rarityBands.json';
import { ContractService } from '../contract/contract.service';
import { ConfigService } from '@nestjs/config';
import { TraitService } from '../traits/trait.service';

@Injectable()
export class FrogService {
  constructor(
    @InjectRepository(Frog) private frogRepo: Repository<Frog>,
    private configService: ConfigService,
    private contractService: ContractService,
    private traitService: TraitService,
  ) {}

  async getOwner(id: number): Promise<string> {
    return this.contractService.getFrogOwner(id);
  }

  async getFrogsOwned(account: string): Promise<Record<string, any>[]> {
    const frogs = await this.contractService.getFrogs(account);
    const mapped = frogs.map((frog) => frog.raw.metadata);
    return mapped;
  }

  /**
   * Fetches all the holders of a ribbit item, then fetches all the frogs owned by them.
   * @param ribbitItemId id of ribbit item to query
   */
  async getFrogsOwnedByRibbitItemHolders(ribbitItemId: number) {
    const itemHolders =
      await this.contractService.getRibbitItemHolders(ribbitItemId);

    let frogCount = 0;
    for (const holder of itemHolders) {
      const frogs = await this.contractService.getFrogs(holder);
      frogCount += frogs.length;
    }

    return {
      itemHolders: itemHolders.length,
      frogCount: frogCount,
    };
  }

  async getFrogsOwnedBySoulboundHolders(soulboundId: number) {
    const soulboundHolders =
      await this.contractService.getSoulboundHolders(soulboundId);

    let frogCount = 0;
    console.log(`processing ${soulboundHolders.length} holders`);

    try {
      for (let i = 0; i < soulboundHolders.length; i++) {
        if (i % 10 === 0) console.log('processing holder: ', i);
        const holder = soulboundHolders[i];
        setTimeout(() => {}, 100);
        const frogs = await this.contractService.getFrogs(holder);
        frogCount += frogs.length;
      }

      return {
        soulboundHolders: soulboundHolders.length,
        frogCount: frogCount,
      };
    } catch (error) {
      console.log('error processing holders: ', error);
      return {
        soulboundHolders: soulboundHolders.length,
        frogCount: frogCount,
      };
    }
  }

  async getFrogsOwnedWithBoosts() {
    const minterSbtHolders = await this.contractService.getSoulboundHolders(1);
    const oneYearSbtHolders = await this.contractService.getSoulboundHolders(2);

    const minterSet = new Set(minterSbtHolders);
    const oneYearSet = new Set(oneYearSbtHolders);

    const common = [];
    for (const holder of minterSet) {
      if (oneYearSet.has(holder)) {
        common.push(holder);
      }
    }

    let frogCount = 0;
    console.log(`processing ${common.length} holders`);

    try {
      for (let i = 0; i < common.length; i++) {
        if (i % 10 === 0) console.log('processing holder: ', i);
        const holder = common[i];
        setTimeout(() => {}, 100);
        const frogs = await this.contractService.getFrogs(holder);
        frogCount += frogs.length;
      }

      return {
        commonHolders: common.length,
        frogCount: frogCount,
      };
    } catch (error) {
      console.log('error processing holders: ', error);
      return {
        commonHolders: common.length,
        frogCount: frogCount,
      };
    }
  }

  async getFrog(id: number): Promise<Frog> {
    return await this.frogRepo.findOneBy({ edition: id });
  }

  formatFrog(frog: Frog): Frog {
    const formattedFrog = { ...frog };
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

  async doesFrogExist(frogId: number, traitId: number): Promise<boolean> {
    const frog = await this.getFrog(frogId);
    const trait = await this.traitService.getTrait(traitId);

    const traits: TraitLayers = {
      Background: frog.background,
      Body: frog.body,
      Eyes: frog.eyes,
      Mouth: frog.mouth,
      Shirt: frog.shirt,
      Hat: frog.hat,
    };
    traits[trait.layer] = trait.name;

    const match = await this.frogRepo.findOneBy({
      background: traits.Background,
      body: traits.Body,
      eyes: traits.Eyes,
      mouth: traits.Mouth,
      shirt: traits.Shirt,
      hat: traits.Hat,
    });
    return match !== null;
  }

  private getFrogRarity(frogId: number): string {
    if (rarity.common.includes(frogId)) {
      return 'Common';
    } else if (rarity.uncommon.includes(frogId)) {
      return 'Uncommon';
    } else if (rarity.rare.includes(frogId)) {
      return 'Rare';
    } else if (rarity.legendary.includes(frogId)) {
      return 'Legendary';
    } else if (rarity.epic.includes(frogId)) {
      return 'Epic';
    } else {
      return 'Common';
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
      ribbit = (frog.friendBoost / 100) * ribbit + ribbit;
    }
    return ribbit;
  }
}
