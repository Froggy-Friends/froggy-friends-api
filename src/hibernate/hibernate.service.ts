import { Injectable } from '@nestjs/common';
import MerkleTree from 'merkletreejs';
import { keccak256 } from 'ethers';
import { ContractService } from '../contract/contract.service';
import { HibernationStats } from './hibernation.stats';

@Injectable()
export class HibernateService {
  glpTree: MerkleTree;
  minterTree: MerkleTree;
  oneYearTree: MerkleTree;
  stats: HibernationStats;

  constructor(private readonly contractService: ContractService) {
    console.log("hibernation service constructor...");
    this.setTrees();
  }

  async setTrees() {
    const glpHolders = await this.contractService.getRibbitItemHolders(1);
    console.log("glp holders: ", glpHolders.length);
    const minterHolders = await this.contractService.getSoulboundHolders(1);
    console.log("minter holders: ", minterHolders.length);
    const oneYearHolders = await this.contractService.getSoulboundHolders(2);
    console.log("one year holders: ", oneYearHolders.length);
    this.glpTree = new MerkleTree(
      glpHolders.map((g) => keccak256(g)),
      keccak256,
      { sortPairs: true },
    );
    console.log("glp tree: ", this.glpTree.getHexRoot());
    this.minterTree = new MerkleTree(
      minterHolders.map((m) => keccak256(m)),
      keccak256,
      { sortPairs: true },
    );
    console.log("minter tree: ", this.minterTree.getHexRoot());
    this.oneYearTree = new MerkleTree(
      oneYearHolders.map((o) => keccak256(o)),
      keccak256,
      { sortPairs: true },
    );
    console.log("one year tree: ", this.oneYearTree.getHexRoot());
  }

  async getRoots() {
    return {
      glp: this.glpTree.getHexRoot(),
      minter: this.minterTree.getHexRoot(),
      oneYear: this.oneYearTree.getHexRoot(),
    };
  }

  async getProof(address: string) {
    const glpProofs = this.glpTree.getHexProof(keccak256(address));
    console.log("glp proofs: ", glpProofs.length);
    const minterProofs = this.minterTree.getHexProof(keccak256(address));
    console.log("minter proofs: ", minterProofs.length);
    const oneYearProofs = this.oneYearTree.getHexProof(keccak256(address));
    console.log("one year proofs: ", oneYearProofs.length);

    if (
      glpProofs.length === 0 &&
      minterProofs.length === 0 &&
      oneYearProofs.length === 0
    ) {
      return [];
    }

    const proofs = [
      this.glpTree.getHexProof(keccak256(address)),
      this.minterTree.getHexProof(keccak256(address)),
      this.oneYearTree.getHexProof(keccak256(address)),
    ];
    console.log("proofs: ", proofs.length);
    return proofs;
  }
}
