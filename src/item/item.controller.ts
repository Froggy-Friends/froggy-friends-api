import { Body, Controller, Get, Param, Post, UseInterceptors, UploadedFiles, Put, UploadedFile, BadRequestException } from "@nestjs/common";
import { Item } from "./item.entity";
import { ItemService } from "./item.service";
import { BigNumber } from "ethers";
import { ItemRequest } from "src/models/ItemRequest";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { ContractService } from 'src/contract/contract.service';
import { PinService } from "src/pin/pin.service";
import { FriendFiles } from "src/models/FriendFiles";
import { ConfigService } from "@nestjs/config";
import { Trait } from "src/traits/trait.entity";
import { TraitService } from "src/traits/trait.service";
import { RuleService } from "src/rules/rule.service";
import { Rule } from "src/rules/rule.entity";

@Controller('/items')
export class ItemsController {
  private pinataUrl: string;

  constructor(
    private readonly itemService: ItemService, 
    private readonly pinService: PinService,
    private readonly contractService: ContractService,
    private readonly configService: ConfigService,
    private readonly traitService: TraitService,
    private readonly ruleService: RuleService
  ) {
    this.pinataUrl = this.configService.get<string>('PINATA_URL');
  }

  @Get()
  getContractItems(): Promise<Item[]> {
    return this.itemService.getAllItems();
  }

  @Get('/:id/details')
  getItem(@Param('id') id: number): Promise<Item> {
    return this.itemService.getItem(id);
  }

  @Get('/owned/:account')
  async getOwnedItems(@Param('account') account: string): Promise<Item[]> {
    return this.itemService.getOwnedItems(account);
  }

  @Get('/:id/owners')
  getItemOwners(@Param('id') id: number) {
    return this.itemService.getItemOwners(id); 
  }

  @Get('/:id/tickets')
  getRaffleTickets(@Param('id') id: number) {
    return this.itemService.getRaffleTicketOwners(id);
  }

  @Get('/admins')
  getAdmins() {
    return this.itemService.getAdmins();
  }

  @Get('/traits/:account')
  async getOwnedTraits(@Param('account') account: string): Promise<Item[]>  {
    return this.itemService.getOwnedTraits(account);
  }

  @Post('/list')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'imageTransparent', maxCount: 1 },
  ]))
  async listItem(@UploadedFiles() files: FriendFiles, @Body() itemRequest: ItemRequest) {
    const item: Item = JSON.parse(itemRequest.item);
    const compatibleTraits: Trait[] = JSON.parse(itemRequest.compatibleTraits);
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, item);

    if (!files.image) {
      throw new BadRequestException("Missing image file");
    }

    if (item.isTrait && !files.imageTransparent && !compatibleTraits.length) {
      throw new BadRequestException("Missing transparent image file");
    }

    const totalListed: BigNumber = await this.contractService.ribbitItems.totalListed();
    item.id = +totalListed + 1;

    // save to contract
    await this.contractService.ribbitItems.listItem(
      item.id,
      item.price,
      item.supply,
      item.isOnSale,
      item.walletLimit
    );

    const imageCID = await this.pinService.upload(item.name, files.image[0].buffer);
    item.image = this.pinataUrl + imageCID.IpfsHash;

    if (item.isTrait) {
      const imageTransparentCID = await this.pinService.upload(item.name, files.imageTransparent[0].buffer);
      item.imageTransparent = this.pinataUrl + imageTransparentCID.IpfsHash;

      // create new trait
      const count = await this.traitService.getCount();
      const trait = new Trait();
      trait.id = count + 1;
      trait.name = item.name;
      trait.imageTransparent = item.imageTransparent;
      trait.layer = item.traitLayer;
      trait.origin = 'new';
      await this.traitService.save(trait);
      
      // save trait id to item
      item.traitId = trait.id;

      // create new trait rule
      let ruleId = await this.ruleService.getLastRuleId();
      for (const compatibleTrait of compatibleTraits) {
        ruleId += 1;
        const rule = new Rule();
        rule.id = ruleId;
        rule.traitId = trait.id;
        rule.compatibleTraitId = compatibleTrait.id;
        await this.ruleService.save(rule);
      }
    } 

    return await this.itemService.save(item);
  }

  @Post('/list/friend')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'imageTransparent', maxCount: 1 },
  ]))
  async listFriend(@UploadedFiles() files: FriendFiles, @Body() itemRequest: ItemRequest) {
    const item: Item = JSON.parse(itemRequest.item);
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, item);

    if (!files.image || !files.imageTransparent) {
      throw new BadRequestException("Missing image files");
    }

    if (!item.isFriend) {
      throw new BadRequestException("Missing friend origin");
    }

    const totalListed: BigNumber = await this.contractService.ribbitItems.totalListed();
    item.id = +totalListed + 1;

    // save to contract
    await this.contractService.ribbitItems.listFriend(
      item.id,
      item.percent,
      item.price,
      item.supply,
      item.isFriend,
      item.isOnSale,
      item.walletLimit
    );

    const imageCID = await this.pinService.upload(item.name, files.image[0].buffer);
    item.image = this.pinataUrl + imageCID.IpfsHash;

    const imageTransparentCID = await this.pinService.upload(item.name, files.imageTransparent[0].buffer);
    item.imageTransparent = this.pinataUrl + imageTransparentCID.IpfsHash;

    // create friend trait
    const count = await this.traitService.getCount();
    const trait = new Trait();
    trait.id = count + 1;
    trait.name = item.name;
    trait.imageTransparent = item.imageTransparent;
    trait.layer = 'Friend';
    trait.origin = 'new';
    await this.traitService.save(trait);
    
    // save trait id to item
    item.traitId = trait.id;

    return await this.itemService.save(item);
  }

  @Post('/list/collab/friend')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'imageTransparent', maxCount: 1 },
  ]))
  async listCollabFriend(@UploadedFiles() files: FriendFiles, @Body() itemRequest: ItemRequest) {
    const item: Item = JSON.parse(itemRequest.item);
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, item);
    
    if (!files.image || !files.imageTransparent) {
      throw new BadRequestException("Missing image files");
    }

    if (!item.isCollabFriend) {
      throw new BadRequestException("Missing friend origin");
    }

    const totalListed: BigNumber = await this.contractService.ribbitItems.totalListed();
    item.id = +totalListed + 1;

    // save to contract
    await this.contractService.ribbitItems.listCollabFriend(
      item.id,
      item.percent,
      item.price,
      item.supply,
      item.isCollabFriend,
      item.isOnSale,
      item.walletLimit,
      item.collabAddress
    );
    
    // save to database
    const imageCID = await this.pinService.upload(item.name, files.image[0].buffer);
    item.image = this.pinataUrl + imageCID.IpfsHash;

    const imageTransparentCID = await this.pinService.upload(item.name, files.imageTransparent[0].buffer);
    item.imageTransparent = this.pinataUrl + imageTransparentCID.IpfsHash;

    // create friend trait
    const count = await this.traitService.getCount();
    const trait = new Trait();
    trait.id = count + 1;
    trait.name = item.name;
    trait.imageTransparent = item.imageTransparent;
    trait.layer = 'Friend';
    trait.origin = 'new';
    await this.traitService.save(trait);
    
    // save trait id to item
    item.traitId = trait.id;

    return await this.itemService.save(item);
  }

  @Put()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'imageTransparent', maxCount: 1 },
  ]))
  async updateItem(@UploadedFiles() files: FriendFiles, @Body() itemRequest: ItemRequest) {
    const item: Item = JSON.parse(itemRequest.item);
    const compatibleTraits: Trait[] = itemRequest.compatibleTraits ? JSON.parse(itemRequest.compatibleTraits) : [];
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, item);
    const dbItem = await this.itemService.getItem(item.id);

    if (item.price !== +dbItem.price) {
      await this.contractService.ribbitItems.setPrice(item.id, item.price);
    }
    if (item.percent !== +dbItem.percent) {
      await this.contractService.ribbitItems.setPercent(item.id, item.percent);
    }
    if (item.supply !== +dbItem.supply) {
      await this.contractService.ribbitItems.setSupply(item.id, item.supply);
    }
    if (item.isBoost !== dbItem.isBoost) {
      await this.contractService.ribbitItems.setIsBoost(item.id, item.isBoost);
    }
    if (item.isOnSale !== dbItem.isOnSale) {
      await this.contractService.ribbitItems.setOnSale(item.id, item.isOnSale);
    }
    if (item.walletLimit !== +dbItem.walletLimit) {
      await this.contractService.ribbitItems.setWalletLimit(item.id, item.walletLimit);
    }

    if (files.image && files.image.length) {
      const imageCID = await this.pinService.upload(item.name, files.image[0].buffer);
      item.image = this.pinataUrl + imageCID.IpfsHash;
    } else if (files.imageTransparent && files.imageTransparent.length) {
      const imageTransparentCID = await this.pinService.upload(item.name, files.imageTransparent[0].buffer);
      item.imageTransparent = this.pinataUrl + imageTransparentCID.IpfsHash;
    }

    let trait: Trait;

    // create new trait
    if (item.isTrait && !item.traitId) {
      const count = await this.traitService.getCount();
      trait = new Trait();
      trait.id = count + 1;
      trait.name = item.name;
      trait.imageTransparent = item.imageTransparent;
      trait.layer = item.traitLayer;
      trait.origin = 'new';
      await this.traitService.save(trait);
      // save trait id to item
      item.traitId = trait.id;
    }

    // update trait properties
    if (item.isTrait && item.traitId) {
      trait = await this.traitService.getTrait(item.traitId);
      trait.name = item.name;
      trait.imageTransparent = item.imageTransparent;
      trait.layer = item.traitLayer;
      await this.traitService.save(trait);
    }

    // overwrite rules
    if (item.isTrait && compatibleTraits.length) {
      // delete old rules
      await this.ruleService.deleteRules(trait.id);
      // save new rules
      let ruleId = await this.ruleService.getLastRuleId();
      for (const compatibleTrait of compatibleTraits) {
        ruleId += 1;
        const rule = new Rule();
        rule.id = ruleId;
        rule.traitId = trait.id;
        rule.compatibleTraitId = compatibleTrait.id;
        await this.ruleService.save(rule);
      }
    }

    return await this.itemService.save(item);
  }

  @Put('/:id/refresh')
  refreshItem(@Param('id') id: number) {
    this.itemService.refreshItem(id);
  }

  @Get('/presets')
  getItemPresets() {
    return {
      categories: ['lilies', 'nfts', 'raffles', 'allowlists', 'friends', 'collabs', 'merch', 'traits'],
      collabIds: [1,2,3,4,5,6,7,8,9,10],
      boosts: [5, 10, 15, 20, 30, 35],
      rarities: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Epic'],
      friendOrigins: ['Genesis', 'Collab'],
      traitLayers: ['Background', 'Body', 'Eyes', 'Mouth', 'Hat', 'Shirt']
    }
  }
}