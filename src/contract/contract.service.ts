import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as abiItems from './abi-items.json';
import { Alchemy, Network, OwnedNft } from 'alchemy-sdk';

@Injectable()
export class ContractService {
  private alchemyKey: string;
  public alchemy: Alchemy;
  public alchemyUrl: string;
  public ribbitItems: any;
  public froggyAddress: string;
  public itemsAddress: string;
  public froggySoulboundAdress: string;
  public ribbitAddress: string;

  constructor(private configs: ConfigService) {
    // addresses
    this.alchemyKey = this.configs.get<string>('ALCHEMY_API_KEY');
    this.alchemyUrl = this.configs.get<string>('ALCHEMY_API_URL');
    this.froggyAddress = this.configs.get<string>('FROGGY_CONTRACT_ADDRESS');
    this.ribbitAddress = this.configs.get<string>('RIBBIT_CONTRACT_ADDRESS');
    this.itemsAddress = this.configs.get<string>('RIBBIT_ITEM_ADDRESS');
    this.froggySoulboundAdress = this.configs.get<string>('FROGGY_SOULBOUND_ADDRESS');
    // chain
    const environment = this.configs.get<string>('ENVIRONMENT');
    const network = environment === 'production' ? Network.ETH_MAINNET : Network.ETH_GOERLI;
    const chainId = environment === 'production' ? 1 : 17000;
    // alchemy
    this.alchemy = new Alchemy({apiKey: this.alchemyKey, network: network});
    // provider
    const alchemyProvider = new ethers.AlchemyProvider({ name: network, chainId: chainId }, this.alchemyKey);
    const wallet = new ethers.Wallet(this.configs.get<string>('PK'), alchemyProvider);
    this.ribbitItems = new ethers.Contract(this.itemsAddress, abiItems, wallet);
  }

  async getFrogOwner(frogId: number): Promise<string> {
    const { owners } = await this.alchemy.nft.getOwnersForNft(
      this.froggyAddress,
      frogId,
    );
    return owners.length >= 0 ? owners[0] : '';
  }

  async getRibbitItemHolders(id: number): Promise<string[]> {
    const { owners } = await this.alchemy.nft.getOwnersForNft(this.itemsAddress, id);
    return owners;
  }

  async getSoulboundHolders(soulboundId: number): Promise<string[]> {
    const { owners } = await this.alchemy.nft.getOwnersForNft(this.froggySoulboundAdress, soulboundId);
    return owners;
  }

  async getFrogs(account: string): Promise<OwnedNft[]> {
    const frogsResponse = await this.alchemy.nft.getNftsForOwner(account, {
      contractAddresses: [this.froggyAddress],
    });
    return frogsResponse.ownedNfts;
  }

  async getItems(account: string): Promise<OwnedNft[]> {
    const nftsResponse = await this.alchemy.nft.getNftsForOwner(account, {
      contractAddresses: [this.itemsAddress],
    });
    return nftsResponse.ownedNfts;
  }
}
