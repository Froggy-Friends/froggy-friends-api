import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Repository } from "typeorm";
import { Item } from "./item.entity";
import { Logger } from "@nestjs/common";
import { BigNumber, ethers } from "ethers";
import Moralis from 'moralis';
import { ContractService } from "src/contract/contract.service";

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    private contractService: ContractService    
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { name: "refreshItems", timeZone: "America/Los_Angeles"})
  async refreshItems() {
    const items = await this.getAllItems();
    for (const item of items) {
      const itemUpdated = {...item};
      const details  = await this.contractService.ribbitItems.item(item.id);
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
      let options = { 
        chain: this.contractService.chain, 
        address: account, 
        tokenAddresses: [this.contractService.ribbitItemsAddress]
      };
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
    return await this.contractService.ribbitItems.itemHolders(id);
  }

  async getRaffleTicketOwners(id: number): Promise<string[]> {
    const owners = await this.contractService.ribbitItems.itemHolders(id);
    const tickets = [];
    for (const owner of owners) {
      const balance = await this.contractService.ribbitItems.balanceOf(owner, id);
      for (let i = 0; i < +balance; i++) {
        tickets.push(owner);
      }
    }
    return tickets;
  }

  async listItem(item: Item) {
    const savedItem = await this.itemRepo.save(item);
    return savedItem;
  }

  async getAllItems(): Promise<Item[]> {
    const [items] = await this.itemRepo.findAndCount();
    return items.sort((a,b) => a.id - b.id);
  }
  
}