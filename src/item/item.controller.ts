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

@Controller('/items')
export class ItemsController {
  private pinataUrl: string;

  constructor(
    private readonly itemService: ItemService, 
    private readonly pinService: PinService,
    private readonly contractService: ContractService,
    private readonly configService: ConfigService
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

  @Post('/list')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'imageTransparent', maxCount: 1 },
  ]))
  async listTrait(@UploadedFiles() files: FriendFiles, @Body() itemRequest: ItemRequest) {
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, itemRequest);

    if (!files.image) {
      throw new BadRequestException("Missing image file");
    }

    if (itemRequest.isTrait && !files.imageTransparent) {
      throw new BadRequestException("Missing transparent image file");
    }

    const totalListed: BigNumber = await this.contractService.ribbitItems.totalListed();
    const itemId = +totalListed + 1;

    // save to contract
    await this.contractService.ribbitItems.listItem(
      itemId,
      itemRequest.price,
      itemRequest.supply,
      itemRequest.isOnSale,
      itemRequest.walletLimit
    );

    const item = new Item(itemRequest);
    item.id = itemId;

    const imageCID = await this.pinService.upload(itemRequest.name, files.image[0].buffer);
    item.image = this.pinataUrl + imageCID.IpfsHash;

    if (itemRequest.isTrait) {
      const imageTransparentCID = await this.pinService.upload(itemRequest.name, files.imageTransparent[0].buffer);
      item.imageTransparent = this.pinataUrl + imageTransparentCID.IpfsHash;
    }

    return await this.itemService.save(item);
  }

  @Post('/list/friend')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'imageTransparent', maxCount: 1 },
  ]))
  async listFriend(@UploadedFiles() files: FriendFiles, @Body() itemRequest: ItemRequest) {
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, itemRequest);

    if (!files.image || !files.imageTransparent) {
      throw new BadRequestException("Missing image files");
    }

    if (!itemRequest.friendOrigin) {
      throw new BadRequestException("Missing friend origin");
    }

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

    const item = new Item(itemRequest);
    item.id = itemId;

    const imageCID = await this.pinService.upload(itemRequest.name, files.image[0].buffer);
    item.image = this.pinataUrl + imageCID.IpfsHash;

    const imageTransparentCID = await this.pinService.upload(itemRequest.name, files.imageTransparent[0].buffer);
    item.imageTransparent = this.pinataUrl + imageTransparentCID.IpfsHash;

    return await this.itemService.save(item);
  }

  @Post('/list/collab/friend')
  @UseInterceptors(FileInterceptor('image'))
  async listCollabFriend(@UploadedFile() file: Express.Multer.File, @Body() itemRequest: ItemRequest) {
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, itemRequest);
    
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
    item.image = this.pinataUrl + imageCID.IpfsHash;
    return await this.itemService.save(item);
  }

  @Put('/:id/contract')
  async updateContract(@Param('id') id: number, @Body() itemRequest: ItemRequest) {
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, itemRequest);
    
    const item = await this.itemService.getItem(id);

    await this.contractService.ribbitItems.setPercent(itemRequest.percent);
    await this.contractService.ribbitItems.setPrice(itemRequest.price);
    await this.contractService.ribbitItems.setSupply(itemRequest.supply);
    await this.contractService.ribbitItems.setIsBoost(itemRequest.isBoost);
    await this.contractService.ribbitItems.setOnSale(itemRequest.isOnSale);

    // save to database
    item.percent = itemRequest.percent;
    item.price = itemRequest.price;
    item.supply = itemRequest.supply;
    item.isBoost = itemRequest.isBoost;
    item.isOnSale = itemRequest.isOnSale;
    return await this.itemService.save(item);
  }

  @Put('/:id/metadata')
  async updateMetadata(@Param('id') id: number, @Body() itemRequest: ItemRequest) {
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, itemRequest);
    
    // save to database
    const item = new Item(itemRequest);
    item.id = id;
    return await this.itemService.save(item);
  }

  @Put('/:id/image')
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(@Param('id') id: number, @UploadedFile() file: Express.Multer.File, @Body() itemRequest: ItemRequest) {
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, itemRequest);
    
    // upload files to pinata
    const imageCID = await this.pinService.upload(itemRequest.name, file.buffer);

    // save to database
    const item = await this.itemService.getItem(id);
    item.image = this.pinataUrl + imageCID.IpfsHash;
    return await this.itemService.save(item);
  }

  @Put('/:id/image/transparent')
  @UseInterceptors(FileInterceptor('image'))
  async updateTransparentImage(@Param('id') id: number, @UploadedFile() file: Express.Multer.File, @Body() itemRequest: ItemRequest) {
    this.itemService.validateRequest(itemRequest.message, itemRequest.signature, itemRequest);
    
    // upload files to pinata
    const imageCID = await this.pinService.upload(itemRequest.name, file.buffer);

    // save to database
    const item = await this.itemService.getItem(id);
    item.imageTransparent = this.pinataUrl + imageCID.IpfsHash;
    return await this.itemService.save(item);
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