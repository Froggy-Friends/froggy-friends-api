import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { ethers } from 'ethers';
import { ContractService } from 'src/contract/contract.service';
import { formatEther, hashMessage } from 'ethers/lib/utils';
import { admins } from './item.admins';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    private contractService: ContractService,
  ) {}

  async getItem(id: number): Promise<Item> {
    return await this.itemRepo.findOneBy({ id: id });
  }

  async refreshItem(id: number) {
    const item = await this.itemRepo.findOneBy({ id: id });
    const details = await this.contractService.ribbitItems.item(item.id);
    item.price = +formatEther(details['0']);
    item.percent = +details['1'];
    item.minted = +details['2'];
    item.supply = +details['3'];
    item.walletLimit = +details['4'];
    item.isBoost = details['5'];
    item.isOnSale = details['6'];
    this.itemRepo.save(item);
  }

  async getOwnedFriends(account: string): Promise<Item[]> {
    const ribbitItems = await this.contractService.getItems(account);

    const owned: Item[] = [];
    for (const ribbitItem of ribbitItems) {
      const metadata = await this.getItem(+ribbitItem.tokenId);
      if (metadata && metadata.isBoost) {
        owned.push(metadata);
      }
    }

    return owned.sort((friendOne, friendTwo) => friendOne.id - friendTwo.id);
  }

  async getOwnedTraits(account: string): Promise<Item[]> {
    const ribbitItems = await this.contractService.getItems(account);
    const owned: Item[] = [];
    for (const ribbitItem of ribbitItems) {
      const metadata = await this.getItem(+ribbitItem.tokenId);
      if (metadata && metadata.isTrait) {
        owned.push(metadata);
      }
    }

    return owned.sort((friendOne, friendTwo) => friendOne.id - friendTwo.id);
  }

  async getItemOwners(id: number): Promise<string[]> {
    return await this.contractService.ribbitItems.itemHolders(id);
  }

  async getRaffleTicketOwners(id: number): Promise<string[]> {
    const owners = await this.contractService.ribbitItems.itemHolders(id);
    const tickets = [];
    for (const owner of owners) {
      const balance = await this.contractService.ribbitItems.balanceOf(
        owner,
        id,
      );
      for (let i = 0; i < +balance; i++) {
        tickets.push(owner);
      }
    }
    return tickets;
  }

  async save(item: Item) {
    return await this.itemRepo.save(item);
  }

  async getActiveItems(): Promise<Item[]> {
    const [items] = await this.itemRepo.findAndCount({
      where: { isArchived: false },
    });
    return items.sort((a, b) => a.id - b.id);
  }

  validateRequest(message: string, signature: string, item: Item) {
    // validate admin
    const signer = ethers.utils.recoverAddress(hashMessage(message), signature);

    if (!admins.includes(signer)) {
      throw new HttpException('Unauthorized admin', HttpStatus.BAD_REQUEST);
    }

    const json = JSON.parse(message);
    if (!json.modifiedBy) {
      throw new HttpException('Invalid message', HttpStatus.BAD_REQUEST);
    }

    // validate item
    if (
      !item.name ||
      !item.description ||
      !item.category ||
      !item.rarity ||
      !item.price ||
      !item.supply ||
      !item.walletLimit ||
      item.isOnSale === undefined ||
      item.isOnSale === null
    ) {
      throw new BadRequestException('Missing item info');
    }
  }

  getAdmins() {
    return admins;
  }
}
