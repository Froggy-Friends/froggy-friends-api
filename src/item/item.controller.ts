import { Body, Controller, Get, Param, Post, HttpStatus, HttpException, UseInterceptors, UploadedFiles, Put, UploadedFile } from "@nestjs/common";
import { Item } from "./item.entity";
import { ItemService } from "./item.service";
import { hashMessage } from "ethers/lib/utils";
import { BigNumber, ethers } from "ethers";
import { ItemRequest } from "src/models/ItemRequest";
import { admins } from './item.admins';
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { ContractService } from 'src/contract/contract.service';
import { PinService } from "src/pin/pin.service";

@Controller('/items')
export class ItemsController {
  constructor(
    private readonly itemService: ItemService, 
    private readonly pinService: PinService,
    private readonly contractService: ContractService
  ) {} 

  @Get()
  getContractItems(): Promise<Item[]> {
    return this.itemService.getAllItems();
  }

  @Get(':id')
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

  @Post('/friend')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'imageTransparent', maxCount: 1 },
  ]))
  async listFriend(
    @UploadedFiles() files: { image?: Express.Multer.File[], imageTransparent?: Express.Multer.File[]},
    @Body() itemRequest: ItemRequest
  ) {
    // verify wallet
    const signer = ethers.utils.recoverAddress(hashMessage(itemRequest.message), itemRequest.signature);

    if (!admins.includes(signer)) {
      throw new HttpException("Unauthorized admin", HttpStatus.BAD_REQUEST);
    }

    const { message } = itemRequest;
    const json = JSON.parse(message);
    if (!json.list) {
      throw new HttpException("Invalid message", HttpStatus.BAD_REQUEST);
    }

    const totalListed: BigNumber = await this.contractService.ribbitItems.totalListed();
    const itemId = totalListed.toNumber() + 1;
    await this.contractService.ribbitItems.listFriend(
      itemId,
      itemRequest.percent,
      itemRequest.price,
      itemRequest.supply,
      itemRequest.boost,
      itemRequest.isOnSale,
      itemRequest.walletLimit,
    );

    // upload files to pinata
    const imageCID = await this.pinService.upload(itemRequest.name, files.image[0].buffer);
    const imageTransparentCID = await this.pinService.upload(itemRequest.name, files.imageTransparent[0].buffer);

    const item = new Item();
    item.id = itemId;
    item.name = itemRequest.name;
    item.description = itemRequest.description;
    item.category = itemRequest.category;
    item.image = imageCID.IpfsHash;
    item.imageTransparent = imageTransparentCID.IpfsHash;
    item.twitter = itemRequest.twitter;
    item.discord = itemRequest.discord;
    item.website = itemRequest.website;
    item.endDate = itemRequest.endDate;
    item.collabId = itemRequest.collabId;
    item.isCommunity = itemRequest.isCommunity;
    item.isBoost = itemRequest.isBoost;
    item.isTrait = itemRequest.isTrait;
    item.isPhysical = itemRequest.isPhysical;
    item.isAllowlist = itemRequest.isAllowlist;
    item.rarity = itemRequest.rarity;
    item.boost = itemRequest.boost;
    item.friendOrigin = itemRequest.friendOrigin;
    item.traitLayer = itemRequest.traitLayer;
    item.price = itemRequest.price;
    item.percent = itemRequest.percent;
    item.minted = itemRequest.minted;
    item.supply = itemRequest.supply;
    item.walletLimit = itemRequest.walletLimit;
    item.isOnSale = itemRequest.isOnSale;
    const listedItem = await this.itemService.listItem(item);
    return listedItem;
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async listItem(@UploadedFile() file: Express.Multer.File, @Body() itemRequest: ItemRequest) {
    // todo: add admin validation and save item in database
  }

  @Put('/:id')
  updateItem(@Param('id') id: number, @Body() item: Item) {
    // todo: add admin validation and update item in database
  }

  @Get('/presets')
  getItemPresets() {
    return {
      categories: ['lilies', 'nfts', 'raffles', 'allowlists', 'friends', 'collabs', 'merch'],
      collabIds: [1,2,3,4,5,6,7,8,9,10],
      boosts: [5, 10, 15, 20, 30, 35],
      rarities: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Epic'],
      friendOrigins: ['Genesis', 'Collab'],
      traitLayers: ['Background', 'Body', 'Eyes', 'Mouth', 'Hat', 'Shirt']
    }
  }
}