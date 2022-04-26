import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import MerkleTree from "merkletreejs";
import { utils } from "ethers";
import wallets from './wallets';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import * as abi from './abi.json';
import * as stakingAbi from './abi-staking.json';
import * as ribbitAbi from './abi-ribbit.json';
import * as rarity from '../rarityBands.json';
import { OwnedResponse } from './models/OwnedResponse';
const keccak = require("keccak256");
const axios = require('axios');
require('dotenv').config();
const { keccak256 } = utils;
const { ALCHEMY_API_URL, CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, RIBBIT_CONTRACT_ADDRESS } = process.env;
const web3 = createAlchemyWeb3(ALCHEMY_API_URL);
const abiItem: any = abi;
const stakingAbiItem: any = stakingAbi;
const ribbitAbiItem: any = ribbitAbi;
const contract = new web3.eth.Contract(abiItem, CONTRACT_ADDRESS);
const stakingContract = new web3.eth.Contract(stakingAbiItem, STAKING_CONTRACT_ADDRESS);
const ribbitContract = new web3.eth.Contract(ribbitAbiItem, RIBBIT_CONTRACT_ADDRESS);

@Injectable()
export class AppService {
  froggylist: MerkleTree;
  rarities: MerkleTree;

  constructor() {
    this.froggylist = new MerkleTree(wallets.map(wallet => keccak256(wallet)), keccak256, { sortPairs: true });
    console.log("froggylist root: ", this.froggylist.getHexRoot());
    const common = rarity.common.map(tokenId => `${tokenId}20`);
    const uncommon = rarity.uncommon.map(tokenId => `${tokenId}30`);
    const rare = rarity.rare.map(tokenId => `${tokenId}40`);
    const legendary = rarity.legendary.map(tokenId => `${tokenId}75`);
    const epic = rarity.epic.map(tokenId => `${tokenId}150`);
    const tokensWithRarity = [...common, ...uncommon, ...rare, ...legendary, ...epic];
    this.rarities = new MerkleTree(tokensWithRarity.map(token => keccak(token)), keccak, { sortPairs: true});
    console.log("rarities root: ", this.rarities.getHexRoot());
  }

  getProof(address: string): string[] {
    return this.froggylist.getHexProof(keccak256(address));
  }

  async getIsOnFroggylist(address: string): Promise<boolean> {
    try {
      let proof = this.froggylist.getHexProof(keccak256(address));
      return await contract.methods.isOnFroggylist(address, proof).call();
    } catch (error) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  async getFroggiesOwned(address: string): Promise<OwnedResponse> {
    try {
      let balanceOfOwner = await contract.methods.balanceOf(address).call();
      const isStakingApproved = await contract.methods.isApprovedForAll(address, STAKING_CONTRACT_ADDRESS).call();
      console.log("is staking approved: ", isStakingApproved);
      const tokensStaked: number[] = await stakingContract.methods.checkallnftstaked(address).call();
      const allowance: number = await ribbitContract.methods.allowance(address, STAKING_CONTRACT_ADDRESS).call();
      console.log("allowance: ", allowance);
      console.log("tokens staked: ", tokensStaked);
      const ownedResponse: OwnedResponse = {
        froggies: [],
        totalRibbit: 0,
        allowance: +allowance,
        isStakingApproved: isStakingApproved
      };
      const froggies = [];
      let totalRibbit = 0;
      for(let i = 0; i < balanceOfOwner; i++) {
        const tokenId = await contract.methods.tokenOfOwnerByIndex(address, i).call();
        const tokenUri = await contract.methods.tokenURI(tokenId).call();
        const response = await axios.get(tokenUri);
        const froggy = {...response.data};
        if (tokensStaked.includes(tokenId)) {
          console.log("token is staking: ", tokenId);
          froggy.isStaked = true;
        } else {
          console.log("token is not staked: ", tokenId);
          froggy.isStaked = false;
        }

        const id = +tokenId;
        if (rarity.common.includes(id)) {
          froggy.ribbit = 20;
        } else if (rarity.uncommon.includes(id)) {
          froggy.ribbit = 30;
        } else if (rarity.rare.includes(id)) {
          froggy.ribbit = 40;
        } else if (rarity.legendary.includes(id)) {
          froggy.ribbit = 75;
        } else if (rarity.epic.includes(id)) {
          froggy.ribbit = 150;
        }
        froggies.push(froggy);
        totalRibbit += froggy.ribbit;
      }

      ownedResponse.froggies = froggies;
      ownedResponse.totalRibbit = totalRibbit;
      return ownedResponse;
    } catch (error) {
      console.log("Get Froggies Owned Error: ", error);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
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
}
