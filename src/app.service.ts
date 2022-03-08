import { Injectable } from '@nestjs/common';
import MerkleTree from "merkletreejs";
import { utils } from "ethers";
import wallets from './wallets';
const { keccak256 } = utils;

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
}
