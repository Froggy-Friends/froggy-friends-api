import { Injectable } from '@nestjs/common';
import MerkleTree from 'merkletreejs';
import { keccak256 } from 'ethers';
import { ContractService } from 'src/contract/contract.service';
import { DuneClient } from '@duneanalytics/client-sdk';
import { ConfigService } from '@nestjs/config';
import { HibernationStats } from './hibernation.stats';

@Injectable()
export class HibernateService {
  glpTree: MerkleTree;
  minterTree: MerkleTree;
  oneYearTree: MerkleTree;
  stats: HibernationStats;

  constructor(
    private readonly contractService: ContractService,
    private readonly config: ConfigService,
  ) {
    this.setTrees();
    const dune = new DuneClient(this.config.get('DUNE_API_KEY'));
    this.setStats(dune);
  }

  async setStats(dune: DuneClient) {
    const {
      result: { rows },
    } = await dune.getLatestResult(3539180);
    const row = rows[0];
    if (row && row.total_frogs_hibernated && row.unique_wallets_hibernated) {
      this.stats = {
        frogs: +row.total_frogs_hibernated,
        holders: +row.unique_wallets_hibernated,
      };
    }
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
    const minterProofs = this.minterTree.getHexProof(keccak256(address));
    const oneYearProofs = this.oneYearTree.getHexProof(keccak256(address));

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
    return proofs;
  }

  async getStats() {
    return this.stats;
  }
}
