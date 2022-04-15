import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import MerkleTree from "merkletreejs";
import { utils } from "ethers";
import wallets from './wallets';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import { FroggiesOwned } from './models/FroggiesOwned';
const axios = require('axios');
require('dotenv').config();
const { keccak256 } = utils;
const { ALCHEMY_API_URL, CONTRACT_ADDRESS } = process.env;
const web3 = createAlchemyWeb3(ALCHEMY_API_URL);
const abi = require('../src/abi.json');
const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

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

  async getFroggiesOwned(address: string): Promise<FroggiesOwned[]> {
    try {
      let balanceOfOwner = await contract.methods.balanceOf(address).call();
      const metadata = [];
      for(let i = 0; i < balanceOfOwner; i++) {
        const tokenId = await contract.methods.tokenOfOwnerByIndex(address, i).call();
        const tokenUri = await contract.methods.tokenURI(tokenId).call();
        const response = await axios.get(tokenUri);
        metadata.push(response.data);
      }
      return metadata;
    } catch (error) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }
}
