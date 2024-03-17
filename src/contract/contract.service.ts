import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as abiItems from './abi-items.json';
import { Alchemy, Network, OwnedNft } from 'alchemy-sdk';

@Injectable()
export class ContractService {
  public alchemy: Alchemy;
  public ribbitItems: any;
  public froggyAddress: string;
  public itemsAddress: string;
  public froggySoulboundAdress: string;

  constructor(private configs: ConfigService) {
    // env variables
    this.froggyAddress = this.configs.get<string>('FROGGY_CONTRACT_ADDRESS');
    this.itemsAddress = this.configs.get<string>('RIBBIT_ITEM_ADDRESS');
    this.froggySoulboundAdress = this.configs.get<string>('FROGGY_SOULBOUND_ADDRESS');
    const apiKey = this.configs.get('ALCHEMY_API_KEY');
    const alchemyUrl = this.configs.get<string>('ALCHEMY_API_URL');
    const pk = this.configs.get<string>('PRIVATE_KEY');
    const environment = this.configs.get<string>('ENVIRONMENT');
    const network = environment === 'production' ? Network.ETH_MAINNET : Network.ETH_SEPOLIA;
    // provider, signer, contract
    const alchemyProvider = new ethers.JsonRpcProvider(alchemyUrl);
    const signer = new ethers.Wallet(pk, alchemyProvider);
    this.ribbitItems = new ethers.Contract(this.itemsAddress, abiItems, signer);
    // alchemy
    this.alchemy = new Alchemy({apiKey, network});
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
