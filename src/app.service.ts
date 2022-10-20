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
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import { Params } from 'node_modules/@moralisweb3/evm-api/lib/resolvers/nft/getWalletNFTs';
const keccak = require("keccak256");
import axios from 'axios';
import { Network, Alchemy, OwnedNft } from 'alchemy-sdk';
require('dotenv').config();
const { keccak256 } = utils;
const { ALCHEMY_API_URL, CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, RIBBIT_CONTRACT_ADDRESS, RIBBIT_ITEM_ADDRESS, IPFS_IMAGE_URL, PIXEL_IMAGE_URL } = process.env;
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
  alchemy: Alchemy;
  chain: EvmChain;

  constructor() {
    this.froggylist = new MerkleTree(wallets.map(wallet => keccak256(wallet)), keccak256, { sortPairs: true });
    const common = rarity.common.map(tokenId => `${tokenId}20`);
    const uncommon = rarity.uncommon.map(tokenId => `${tokenId}30`);
    const rare = rarity.rare.map(tokenId => `${tokenId}40`);
    const legendary = rarity.legendary.map(tokenId => `${tokenId}75`);
    const epic = rarity.epic.map(tokenId => `${tokenId}150`);
    const tokensWithRarity = [...common, ...uncommon, ...rare, ...legendary, ...epic];
    this.rarities = new MerkleTree(tokensWithRarity.map(token => keccak(token)), keccak, { sortPairs: true});
    this.alchemy = new Alchemy({
      apiKey: `${process.env.ALCHEMY_API_KEY}`,
      network: Network.ETH_MAINNET
    });
    this.chain = process.env.NODE_ENV === "production" ? EvmChain.ETHEREUM : EvmChain.GOERLI;
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
    if (rarity.common.includes(+edition)) {
      return 20;
    } else if (rarity.uncommon.includes(+edition)) {
      return 30;
    } else if (rarity.rare.includes(+edition)) {
      return 40;
    } else if (rarity.legendary.includes(+edition)) {
      return 75;
    } else if (rarity.epic.includes(+edition)) {
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
      // get staked tokens
      const stakedTokens: number[] = await stakingContract.methods.deposits(address).call();

      // get unstaked tokens
      const options: Params = { chain: this.chain, address: address, tokenAddresses: [CONTRACT_ADDRESS] };
      const unstakedTokens = (await Moralis.EvmApi.nft.getWalletNFTs(options)).result;

      const froggies = [];
      let totalRibbit = 0;

      for (const tokenId of stakedTokens) {
        const ribbit = this.getRibbit(+tokenId)
        froggies.push({
          name: `Froggy #${tokenId}`,
          image: `${IPFS_IMAGE_URL}/${tokenId}.png`,
          edition: +tokenId,
          isStaked: true,
          ribbit: ribbit
        });
        totalRibbit += ribbit;
      }

      for (const token of unstakedTokens) {
        const nft = token.format();
        froggies.push({
          ...nft.metadata,
          isStaked: false,
          ribbit: 0
        });
      }

      const isStakingApproved = await contract.methods.isApprovedForAll(address, STAKING_CONTRACT_ADDRESS).call();
      const allowance: number = await ribbitContract.methods.allowance(address, STAKING_CONTRACT_ADDRESS).call();

      return {
        froggies: froggies,
        totalRibbit: totalRibbit,
        allowance: +allowance,
        isStakingApproved: isStakingApproved
      };
    } catch (error) {
      console.log("Get Froggies Owned Error: ", error);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  async getFriendsOwned(address: string) {
    let options = { chain: this.chain, address: address, token_address: RIBBIT_ITEM_ADDRESS};
    const friends = (await Moralis.EvmApi.nft.getWalletNFTs(options))
      .result
      .filter(token => {
        const nft = token.format();
        return token.tokenAddress.lowercase === RIBBIT_ITEM_ADDRESS.toLowerCase() && nft.metadata.isBoost;
      })
      .map(token => {
        const nft = token.format();
        return nft.metadata;
      });

    return friends;
  }

  async getNftsOwned(account: string, contract: string): Promise<OwnedNft[]> {
    const nfts = await this.alchemy.nft.getNftsForOwner(account);
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
}
