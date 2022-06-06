import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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

  constructor() {

  }

  getItem(id: string): Metadata {
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      throw new HttpException('Item ID must be a number', HttpStatus.BAD_REQUEST);
    }
    
    const index = items.findIndex(item => item.id === itemId);

    if (index === -1) {
      throw new HttpException('Item ID invalid', HttpStatus.BAD_REQUEST);
    }

    return items[index];
  }

  getItems(): Metadata[] {
    return items;
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
        console.log("get contract details error: ", error);
      }
    }

    return ribbitItems;
  }
}