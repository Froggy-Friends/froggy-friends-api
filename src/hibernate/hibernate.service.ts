import { Injectable } from "@nestjs/common";
import MerkleTree from "merkletreejs";
import { keccak256 } from "ethers";
import { ContractService } from "src/contract/contract.service";
const keccak = require("keccak256");

@Injectable()
export class HibernateService {
  glpTree: MerkleTree;
  minterTree: MerkleTree;
  oneYearTree: MerkleTree;

  constructor(private readonly contractService: ContractService) {
    this.setTrees();
  }

  async setTrees() {
    const glpHolders = await this.contractService.getRibbitItemHolders(1);
    const minterHolders = await this.contractService.getSoulboundHolders(1);
    const oneYearHolders = await this.contractService.getSoulboundHolders(2);
    this.glpTree = new MerkleTree(glpHolders.map(g => keccak256(g)), keccak256, { sortPairs: true});
    this.minterTree = new MerkleTree(minterHolders.map(m => keccak256(m)), keccak256, { sortPairs: true});
    this.oneYearTree = new MerkleTree(oneYearHolders.map(o => keccak256(o)), keccak256, { sortPairs: true});
  }

  async getRoots() {
    return {
      "glp": this.glpTree.getHexRoot(),
      "minter": this.minterTree.getHexRoot(),
      "oneYear": this.oneYearTree.getHexRoot()
    }
  }

  async getProof(address: string) {
    const glpProofs = this.glpTree.getHexProof(keccak256(address));
    const minterProofs = this.minterTree.getHexProof(keccak256(address));
    const oneYearProofs = this.oneYearTree.getHexProof(keccak256(address));

    if (glpProofs.length === 0 && minterProofs.length === 0 && oneYearProofs.length === 0) {
      return [];
    }

    const proofs = [
      this.glpTree.getHexProof(keccak256(address)),
      this.minterTree.getHexProof(keccak256(address)),
      this.oneYearTree.getHexProof(keccak256(address)),
    ];
    return proofs;
  }
}