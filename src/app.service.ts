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
import { Froggy } from './models/Froggy';
const Moralis = require("moralis/node");
const keccak = require("keccak256");
import axios from 'axios';
require('dotenv').config();
const { keccak256 } = utils;
const { ALCHEMY_API_URL, CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, RIBBIT_CONTRACT_ADDRESS, IPFS_IMAGE_URL, PIXEL_IMAGE_URL } = process.env;
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

  getRarity(edition: number): string {
    if (rarity.common.includes(edition)) {
      return "common";
    } else if (rarity.uncommon.includes(edition)) {
      return "uncommon";
    } else if (rarity.rare.includes(edition)) {
      return "rare";
    } else if (rarity.legendary.includes(edition)) {
      return "legendary";
    } else if (rarity.epic.includes(edition)) {
      return "epic";
    } else {
      return "common";
    }
  }

  getRibbit(edition: number): number {
    if (rarity.common.includes(edition)) {
      return 20;
    } else if (rarity.uncommon.includes(edition)) {
      return 30;
    } else if (rarity.rare.includes(edition)) {
      return 40;
    } else if (rarity.legendary.includes(edition)) {
      return 75;
    } else if (rarity.epic.includes(edition)) {
      return 150;
    } else {
      return 0;
    }
  }

  async getIsOnFroggylist(address: string): Promise<boolean> {
    try {
      let proof = this.froggylist.getHexProof(keccak256(address));
      return await contract.methods.isOnFroggylist(address, proof).call();
    } catch (error) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  async getFroggy(id: number): Promise<Froggy> {
    const baseUrl: string = await contract.methods.froggyUrl().call();
    const froggy = (await axios.get<Froggy>(baseUrl + id)).data;
    const ownerOf: string = await contract.methods.ownerOf(id).call();
    const proof = this.getStakeProof([+id]);
    const rewardRate = await stakingContract.methods.getTokenRewardRate(id, proof[0]).call();
    froggy.isStaked = ownerOf == STAKING_CONTRACT_ADDRESS;
    froggy.ribbit = this.getRibbit(froggy.edition);
    froggy.rarity = this.getRarity(froggy.edition);
    froggy.isPaired = rewardRate > froggy.ribbit;
    froggy.imagePixel = `${PIXEL_IMAGE_URL}/${froggy.edition}.png`;
    froggy.image3d = '';
    return froggy;
  }

  async getFroggiesOwned(address: string): Promise<OwnedResponse> {
    try {
      // get staking token ids
      const tokensStaked: number[] = await stakingContract.methods.deposits(address).call();

      // get unstaking token ids
      const options = {
        chain: "Eth",
        address: address,
        token_address: CONTRACT_ADDRESS
      };
      const unstaked = await Moralis.Web3API.account.getNFTsForContract(options);
      const isStakingApproved = await contract.methods.isApprovedForAll(address, STAKING_CONTRACT_ADDRESS).call();
      const allowance: number = await ribbitContract.methods.allowance(address, STAKING_CONTRACT_ADDRESS).call();

      const ownedResponse: OwnedResponse = {
        froggies: [],
        totalRibbit: 0,
        allowance: +allowance,
        isStakingApproved: isStakingApproved
      };
      const froggies = [];
      let totalRibbit = 0;

      // remove staked tokens from unstaked moralis list
      const results = unstaked.result.filter((nft: any) => !tokensStaked.includes(nft.token_id));

      for(const result of results) {
        const froggy: Froggy = {
          name: `Froggy #${result.token_id}`,
          image: `${IPFS_IMAGE_URL}/${result.token_id}.png`,
          edition: +result.token_id,
          isStaked: false,
          ribbit: 0
        };
        
        if (rarity.common.includes(froggy.edition)) {
          froggy.ribbit = 20;
        } else if (rarity.uncommon.includes(froggy.edition)) {
          froggy.ribbit = 30;
        } else if (rarity.rare.includes(froggy.edition)) {
          froggy.ribbit = 40;
        } else if (rarity.legendary.includes(froggy.edition)) {
          froggy.ribbit = 75;
        } else if (rarity.epic.includes(froggy.edition)) {
          froggy.ribbit = 150;
        }
        froggies.push(froggy);
        totalRibbit += froggy.ribbit;
      }

      for (const tokenId of tokensStaked) {
        const froggy: Froggy = {
          name: `Froggy #${tokenId}`,
          image: `${IPFS_IMAGE_URL}/${tokenId}.png`,
          edition: +tokenId,
          isStaked: true,
          ribbit: 0
        }
        
        froggy.ribbit = this.getRibbit(tokenId);
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
