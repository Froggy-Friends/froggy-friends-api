import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Metadata } from "../models/metadata";
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
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor() {

  }

  private parseItem(id: string): { index: number, itemId: number} {
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      throw new HttpException('Item ID must be a number', HttpStatus.BAD_REQUEST);
    }
    
    const index = items.findIndex(item => item.id === itemId);

    if (index === -1) {
      throw new HttpException('Item ID invalid', HttpStatus.BAD_REQUEST);
    }
    return {
      index, itemId
    };
  }

  getItem(id: string): Metadata {
    const item = this.parseItem(id);
    return items[item.index];
  }

  getItems(): Metadata[] {
    return items;
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

  async getItemOwners(id: string): Promise<string[]> {
    const item = this.parseItem(id);
    return await ribbitItemContract.methods.itemHolders(item.itemId).call();
  }

  async getRaffleTickets(id: string): Promise<string[]> {
    const item = this.parseItem(id);
    const owners = await ribbitItemContract.methods.itemHolders(item.itemId).call();
    const tickets = [];
    for (const owner of owners) {
      const balance = await ribbitItemContract.methods.balanceOf(owner, item.itemId).call();
      for (let i = 0; i < balance; i++) {
        tickets.push(owner);
      }
    }
    return tickets;
  }
}