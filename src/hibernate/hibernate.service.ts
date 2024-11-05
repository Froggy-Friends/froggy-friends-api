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
    console.error("hibernation service constructor...");
    this.setTrees();
  }

  async setTrees() {
    const glpHolders = await this.contractService.getRibbitItemHolders(1);
    const minterHolders = await this.contractService.getSoulboundHolders(1);
    const oneYearHolders = await this.contractService.getSoulboundHolders(2);
    this.glpTree = new MerkleTree(
      glpHolders.map((g) => keccak256(g)),
      keccak256,
      { sortPairs: true },
    );
    this.minterTree = new MerkleTree(
      minterHolders.map((m) => keccak256(m)),
      keccak256,
      { sortPairs: true },
    );
    this.oneYearTree = new MerkleTree(
      oneYearHolders.map((o) => keccak256(o)),
      keccak256,
      { sortPairs: true },
    );
    console.log("set trees info: ", {
      glpHolders: glpHolders.length,
      minterHolders: minterHolders.length,
      oneYearHolders: oneYearHolders.length,
      glpRoot: this.glpTree.getHexRoot(),
      minterRoot: this.minterTree.getHexRoot(),
      oneYearRoot: this.oneYearTree.getHexRoot(),
    })
  }

  async getRoots() {
    return {
      glp: this.glpTree.getHexRoot(),
      minter: this.minterTree.getHexRoot(),
      oneYear: this.oneYearTree.getHexRoot(),
    };
  }

  async getProof(address: string) {
    console.log("trees: ", {
      glpTree: this.glpTree ? this.glpTree.getHexRoot() : 'GLP Tree not set',
      minterTree: this.minterTree ? this.minterTree.getHexRoot() : 'Minter Tree not set',
      oneYearTree: this.oneYearTree ? this.oneYearTree.getHexRoot() : 'One Year Tree not set',
    })
    const glpProofs = this.glpTree.getHexProof(keccak256(address));
    const minterProofs = this.minterTree.getHexProof(keccak256(address));
    const oneYearProofs = this.oneYearTree.getHexProof(keccak256(address));
    console.log("proofs: ", {
      glpProofs: glpProofs.length,
      minterProofs: minterProofs.length,
      oneYearProofs: oneYearProofs.length,
    })

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
