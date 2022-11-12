import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Item } from "./item.entity";
import { ItemBooleans } from './ItemBooleans';
import { ItemNumbers } from './ItemNumbers';
import { ItemStrings } from './ItemStrings';

import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { RibbitItem } from '../models/RibbitItem';
import { items } from '../data/items';
import { metadata } from '../data/contract-metadata';
import { ContractMetadata } from './../models/ContractMetadata';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import * as ribbitAbi from '../abii-items.json';
import { ethers } from "ethers";
require('dotenv').config();
const { ALCHEMY_API_URL, RIBBIT_ITEM_ADDRESS } = process.env;
const web3 = createAlchemyWeb3(ALCHEMY_API_URL);
const ribbitItemAbi: any = ribbitAbi;
const ribbitItemContract = new web3.eth.Contract(ribbitItemAbi, RIBBIT_ITEM_ADDRESS);

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(@InjectRepository(Item) private itemRepo: Repository<Item>) {

  }

  async getItem(id: number): Promise<RibbitItem> {
    const item = await this.itemRepo.findOneBy({ id: id });

    try {
      const details  = await ribbitItemContract.methods.item(item.id).call();
      const price = details['0'];
      const percent = details['1'];
      const minted = details['2'];
      const supply = details['3'];
      const walletLimit = details['4'];
      const isBoost = details['5'];
      const isOnSale = details['6'];

      const etherPrice = +ethers.utils.formatEther(price);

      let finalRibbitItem: RibbitItem = {
        ...item,
        price: etherPrice,
        percentage: +percent,
        minted: +minted,
        supply: +supply,
        walletLimit: +walletLimit,
        isBoost: isBoost,
        isOnSale: isOnSale,
      }
      return finalRibbitItem;
    } catch (error) {
      this.logger.error("Get item details error: " + error);
      throw new HttpException("Get item error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOwnedItems(account: string): Promise<RibbitItem[]> {
    try {
      // get item balances for account
      const accounts = new Array(items.length).fill(account);
      const itemIds = Array.from({length: accounts.length}, (_, i) => i + 1);
      const itemBalances: string[] = await ribbitItemContract.methods.balanceOfBatch(accounts, itemIds).call();
      // fetch metadata for items with balances
      let itemsOwned: RibbitItem[] = [];
      let index = 0;
      for (const balance of itemBalances) {
        const itemId = index + 1;
        if (+balance) {
          const details  = await ribbitItemContract.methods.item(itemId).call();
          const price = details['0'];
          const percent = details['1'];
          const minted = details['2'];
          const supply = details['3'];
          const walletLimit = details['4'];
          const isBoost = details['5'];
          const isOnSale = details['6'];

          const etherPrice = +ethers.utils.formatEther(price);

          let ribbitItem: RibbitItem = {
            ...items[index],
            price: etherPrice,
            percentage: +percent,
            minted: +minted,
            supply: +supply,
            walletLimit: +walletLimit,
            isBoost: isBoost,
            isOnSale: isOnSale,
          }
          itemsOwned.push(ribbitItem);
        }
        index++;
      }
      return itemsOwned;
    } catch (error) {
      console.log("get items owned error: ", error);
      return [];
    }
  }

  getContractMetadata(): ContractMetadata {
    return metadata;
  }

  async getContractItems(): Promise<RibbitItem[]> {
    let ribbitItems: RibbitItem[] = [];

    for (const item of items) {
      try {
        const details  = await ribbitItemContract.methods.item(item.id).call();
        const price = details['0'];
        const percent = details['1'];
        const minted = details['2'];
        const supply = details['3'];
        const walletLimit = details['4'];
        const isBoost = details['5'];
        const isOnSale = details['6'];

        const etherPrice = +ethers.utils.formatEther(price);

        let ribbitItem: RibbitItem = {
          ...item,
          price: etherPrice,
          percentage: +percent,
          minted: +minted,
          supply: +supply,
          walletLimit: +walletLimit,
          isBoost: isBoost,
          isOnSale: isOnSale,
        }
        
        ribbitItems.push(ribbitItem);
      } catch (error) {
        this.logger.error("Get item details error: " + error);
      }
    }

    return ribbitItems;
  }

  async getItemOwners(id: number): Promise<string[]> {
    return await ribbitItemContract.methods.itemHolders(id).call();
  }

  async getRaffleTickets(id: number): Promise<string[]> {
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

  getItems(): Promise<Item[]> {
   return this.itemRepo.find({ 
      where: { 
        id: Not(null)
      }
    });
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