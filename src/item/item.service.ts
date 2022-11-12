import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Item } from "./item.entity";
import { ItemBooleans } from './ItemBooleans';
import { ItemNumbers } from './ItemNumbers';
import { ItemStrings } from './ItemStrings';

@Injectable()
export class ItemService {
  
  constructor(@InjectRepository(Item) private itemRepo: Repository<Item>) {

  }

  getItems(): Promise<Item[]> {
   return this.itemRepo.find({ 
      where: { 
        id: Not(null)
      }
    });
  }

  getItem(id: number): Promise<Item> {
    return this.itemRepo.findOneBy({ id: id });
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