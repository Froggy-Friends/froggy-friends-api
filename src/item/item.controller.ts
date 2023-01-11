import { Body, Controller, Get, Param, Post, UseInterceptors, UploadedFiles, Put, UploadedFile } from "@nestjs/common";
import { Item } from "./item.entity";
import { ItemService } from "./item.service";
import { BigNumber } from "ethers";
import { ItemRequest } from "src/models/ItemRequest";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { ContractService } from 'src/contract/contract.service';
import { PinService } from "src/pin/pin.service";
import { FriendFiles } from "src/models/FriendFiles";

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
  async listFriend(@UploadedFiles() files: FriendFiles, @Body() itemRequest: ItemRequest) {
    this.itemService.validateAdmin(itemRequest.message, itemRequest.signature);

    const totalListed: BigNumber = await this.contractService.ribbitItems.totalListed();
    const itemId = +totalListed + 1;

    // save to contract
    await this.contractService.ribbitItems.listFriend(
      itemId,
      itemRequest.percent,
      itemRequest.price,
      itemRequest.supply,
      itemRequest.isBoost,
      itemRequest.isOnSale,
      itemRequest.walletLimit,
    );

    // upload files to pinata
    const imageCID = await this.pinService.upload(itemRequest.name, files.image[0].buffer);
    const imageTransparentCID = await this.pinService.upload(itemRequest.name, files.imageTransparent[0].buffer);

    // save to database
    const item = new Item(itemRequest);
    item.id = itemId;
    item.image = imageCID.IpfsHash;
    item.imageTransparent = imageTransparentCID.IpfsHash;
    const listedItem = await this.itemService.save(item);
    return listedItem;
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async listItem(@UploadedFile() file: Express.Multer.File, @Body() itemRequest: ItemRequest) {
    this.itemService.validateAdmin(itemRequest.message, itemRequest.signature);
    
    const totalListed: BigNumber = await this.contractService.ribbitItems.totalListed();
    const itemId = +totalListed + 1;

    // save to contract
    await this.contractService.ribbitItems.listFriend(
      itemId,
      itemRequest.percent,
      itemRequest.price,
      itemRequest.supply,
      itemRequest.isBoost,
      itemRequest.isOnSale,
      itemRequest.walletLimit,
    );

    // upload files to pinata
    const imageCID = await this.pinService.upload(itemRequest.name, file.buffer);

    // save to database
    const item = new Item(itemRequest);
    item.id = itemId;
    item.image = imageCID.IpfsHash; //todo: store hostname
    const listedItem = await this.itemService.save(item);
    return listedItem;
  }

  @Put('/:id')
  async updateItem(@Param('id') id: number, @Body() itemRequest: ItemRequest) {
    this.itemService.validateAdmin(itemRequest.message, itemRequest.signature);
    
    const item = await this.itemService.getItem(itemRequest.id);

    if (item.percent !== itemRequest.percent) {
      await this.contractService.ribbitItems.setPercent(itemRequest.percent);
    }

    if (item.price !== itemRequest.price) {
      await this.contractService.ribbitItems.setPrice(itemRequest.price);
    }

    if (item.supply !== itemRequest.supply) {
      await this.contractService.ribbitItems.setSupply(itemRequest.supply);
    }
    
    if (item.isBoost !== itemRequest.isBoost) {
      await this.contractService.ribbitItems.setIsBoost(itemRequest.isBoost);
    }
    
    if (item.isOnSale !== itemRequest.isOnSale) {
      await this.contractService.ribbitItems.setOnSale(itemRequest.isOnSale);
    }

    // save to database
    const updatedItem = new Item(itemRequest);
    const listedItem = await this.itemService.save(updatedItem);
    return listedItem;
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