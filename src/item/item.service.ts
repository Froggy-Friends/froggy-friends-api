import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Repository } from "typeorm";
import { Item } from "./item.entity";
import { ItemBooleans } from './ItemBooleans';
import { ItemNumbers } from './ItemNumbers';
import { ItemStrings } from './ItemStrings';

import { Logger } from "@nestjs/common";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import * as ribbitAbi from '../abii-items.json';
import { ethers } from "ethers";
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
require('dotenv').config();
const { ALCHEMY_API_URL, RIBBIT_ITEM_ADDRESS } = process.env;
const web3 = createAlchemyWeb3(ALCHEMY_API_URL);
const ribbitItemAbi: any = ribbitAbi;
const ribbitItemContract = new web3.eth.Contract(ribbitItemAbi, RIBBIT_ITEM_ADDRESS);

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);
  chain: EvmChain;

  constructor(@InjectRepository(Item) private itemRepo: Repository<Item>) {
    this.chain = process.env.NODE_ENV === "production" ? EvmChain.ETHEREUM : EvmChain.GOERLI;
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { name: "refreshItems", timeZone: "America/Los_Angeles"})
  async refreshItems() {
    const items = await this.getAllItems();
    for (const item of items) {
      const itemUpdated = {...item};
      const details  = await ribbitItemContract.methods.item(item.id).call();
      const price = details['0'];
      const percent = details['1'];
      const minted = details['2'];
      const supply = details['3'];
      const walletLimit = details['4'];
      const isBoost = details['5'];
      const isOnSale = details['6'];
      const etherPrice = +ethers.utils.formatEther(price);
      itemUpdated.price = etherPrice;
      itemUpdated.percent = +percent;
      itemUpdated.minted = +minted;
      itemUpdated.supply = +supply;
      itemUpdated.walletLimit = +walletLimit;
      itemUpdated.isBoost = isBoost;
      itemUpdated.isOnSale = isOnSale;
      await this.itemRepo.save(itemUpdated);
    }
  }

  async getItem(id: number): Promise<Item> {
    return await this.itemRepo.findOneBy({ id: id });
  }

  async getOwnedItems(account: string): Promise<Item[]> {
    try {
      // get ribbit items from wallet
      let options = { chain: this.chain, address: account, tokenAddresses: [RIBBIT_ITEM_ADDRESS]};
      const nfts = (await Moralis.EvmApi.nft.getWalletNFTs(options)).result.map(r => r.format());
      let owned: Item[] = [];
      for (const nft of nfts) {
        const item =  await this.getItem(Number(nft.tokenId));
        owned.push(item);
      }
      return owned.sort((a,b) => a.id - b.id);
    } catch (error) {
      console.log("get items owned error: ", error);
      return [];
    }
  }

  async getItemOwners(id: number): Promise<string[]> {
    return await ribbitItemContract.methods.itemHolders(id).call();
  }

  async getRaffleTicketOwners(id: number): Promise<string[]> {
    const owners = await ribbitItemContract.methods.itemHolders(id).call();
    const tickets = [];
    for (const owner of owners) {
      const balance = await ribbitItemContract.methods.balanceOf(owner, id).call();
      for (let i = 0; i < balance; i++) {
        tickets.push(owner);
      }
    }
    return tickets;
  }

  async getAllItems(): Promise<Item[]> {
    const [items] = await this.itemRepo.findAndCount();
    return items.sort((a,b) => a.id - b.id);
  }

  async saveItem(
    itemNumbers: ItemNumbers,
    itemStrings: ItemStrings,
    itemBooleans: ItemBooleans
  ): Promise<Item> {
    const item = new Item();
    item.endDate = itemNumbers.endDate;
    item.collabId = itemNumbers.collabId;
    item.boost = itemNumbers.boost;
    item.name = itemStrings.name;
    item.description = itemStrings.description;
    item.category = itemStrings.category;
    item.image = itemStrings.image;
    item.imageTransparent = itemStrings.imageTransparent;
    item.previewImage = itemStrings.previewImage;
    item.twitter = itemStrings.twitter;
    item.discord = itemStrings.discord;
    item.website = itemStrings.website;
    item.rarity = itemStrings.rarity;
    item.friendOrigin = itemStrings.friendOrigin;
    item.traitLayer = itemStrings.traitLayer;
    item.isCommunity = itemBooleans.isCommunity;
    item.isBoost = itemBooleans.isBoost;
    item.isTrait = itemBooleans.isTrait;
    item.isPhysical = itemBooleans.isPhysical;
    item.isAllowlist = itemBooleans.isAllowlist;
    return await this.itemRepo.save(item);
  }

  
}