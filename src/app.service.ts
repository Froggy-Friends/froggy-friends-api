import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import MerkleTree from "merkletreejs";
import { utils } from "ethers";
import wallets from './wallets';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import * as abi from './abi.json';
import * as rarity from '../rarityBands.json';
import { OwnedResponse } from './models/OwnedResponse';
const axios = require('axios');
require('dotenv').config();
const { keccak256 } = utils;
const { ALCHEMY_API_URL, CONTRACT_ADDRESS } = process.env;
const web3 = createAlchemyWeb3(ALCHEMY_API_URL);
const abiItem: any = abi;
const contract = new web3.eth.Contract(abiItem, CONTRACT_ADDRESS);

@Injectable()
export class AppService {
  froggylist: MerkleTree;

  constructor() {
    this.froggylist = new MerkleTree(wallets.map(wallet => keccak256(wallet)), keccak256, { sortPairs: true });
    console.log("froggylist root: ", this.froggylist.getHexRoot());
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
      const ownedResponse: OwnedResponse = {
        froggies: [],
        totalRibbit: 0
      };
      const froggies = [];
      let totalRibbit = 0;
      for(let i = 0; i < balanceOfOwner; i++) {
        const tokenId = await contract.methods.tokenOfOwnerByIndex(address, i).call();
        const tokenUri = await contract.methods.tokenURI(tokenId).call();
        const response = await axios.get(tokenUri);
        const froggy = {...response.data};
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
}
