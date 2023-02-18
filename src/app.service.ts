import { formatEther } from 'ethers/lib/utils';
import { Injectable } from '@nestjs/common';
import MerkleTree from "merkletreejs";
import { utils } from "ethers";
import wallets from './wallets';
import * as rarity from '../rarityBands.json';
import Moralis from 'moralis';
const keccak = require("keccak256");
import { OwnedNft } from 'alchemy-sdk';
import { ItemService } from './item/item.service';
import { Item } from './item/item.entity';
import { ContractService } from './contract/contract.service';
require('dotenv').config();
const { keccak256 } = utils;
const { RIBBIT_ITEM_ADDRESS } = process.env;

@Injectable()
export class AppService {
  froggylist: MerkleTree;
  rarities: MerkleTree;

  constructor(private readonly itemService: ItemService, private readonly contractService: ContractService) {
    this.froggylist = new MerkleTree(wallets.map(wallet => keccak256(wallet)), keccak256, { sortPairs: true });
    const common = rarity.common.map(tokenId => `${tokenId}20`);
    const uncommon = rarity.uncommon.map(tokenId => `${tokenId}30`);
    const rare = rarity.rare.map(tokenId => `${tokenId}40`);
    const legendary = rarity.legendary.map(tokenId => `${tokenId}75`);
    const epic = rarity.epic.map(tokenId => `${tokenId}150`);
    const tokensWithRarity = [...common, ...uncommon, ...rare, ...legendary, ...epic];
    this.rarities = new MerkleTree(tokensWithRarity.map(token => keccak(token)), keccak, { sortPairs: true});
  }

  getProof(address: string): string[] {
    return this.froggylist.getHexProof(keccak256(address));
  }

  async getFriendsOwned(address: string) {
    let options = { chain: this.contractService.chain, address: address, tokenAddresses: [RIBBIT_ITEM_ADDRESS]};
    const ribbitItems = (await Moralis.EvmApi.nft.getWalletNFTs(options)).result.map(r => r.format());
    let owned: Item[] = [];
    for (const ribbitItem of ribbitItems) {
      const metadata =  await this.itemService.getItem(+ribbitItem.tokenId);
      if (metadata && metadata.isBoost) {
        owned.push(metadata);
      }
    }

    return owned.sort((friendOne, friendTwo) => friendOne.id - friendTwo.id);
  }

  async getNftsOwned(account: string, contract: string): Promise<OwnedNft[]> {
    const nfts = await this.contractService.alchemy.nft.getNftsForOwner(account);
    return nfts.ownedNfts.filter(nft => nft.contract.address.toLowerCase() == contract.toLowerCase());
  }

  getStakeProof(tokenIds: number[]): string[] {
    const stakeProof = [];
    for (const tokenId of tokenIds) {
      let leaf = '';
      if (rarity.common.includes(tokenId)) {
        leaf = keccak(`${tokenId}20`);
      } else if (rarity.uncommon.includes(tokenId)) {
        leaf = keccak(`${tokenId}30`);
      } else if (rarity.rare.includes(tokenId)) {
        leaf = keccak(`${tokenId}40`);
      } else if (rarity.legendary.includes(tokenId)) {
        leaf = keccak(`${tokenId}75`);
      } else if (rarity.epic.includes(tokenId)) {
        leaf = keccak(`${tokenId}150`);
      }
      const proof = this.rarities.getHexProof(leaf);
      stakeProof.push(proof);
    }
    return stakeProof;
  }

  async getAccountTokens(account: string): Promise<number> {
    const ribbitBalanceGwei: string = await this.contractService.ribbit.methods.balanceOf(account).call();
    const format = formatEther(ribbitBalanceGwei);
    const balance = Number(format).toFixed(2);
    return +balance;
  }

  async getAccountTokensStaked(account: string): Promise<number> {
    const stakingBalanceGwei: string = await this.contractService.staking.methods.balanceOf(account).call();
    const format = formatEther(stakingBalanceGwei);
    const balance = Number(format).toFixed(2);
    return +balance;
  }
}
