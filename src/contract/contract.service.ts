import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, ethers, Network } from 'ethers';
import * as abiItems from './abi-items.json';
import * as abiFroggy from './froggyfriends.json';
import { Alchemy, Network as AlchemyNetwork, OwnedNft } from 'alchemy-sdk';

@Injectable()
export class ContractService {
  public alchemy: Alchemy;
  public ribbitItems: Contract;
  public froggyAddress: string;
  public itemsAddress: string;
  public froggySoulboundAdress: string;

  private froggyFriends: Contract;

  constructor(private configs: ConfigService) {
    // env variables
    const environment = this.configs.get<string>('ENVIRONMENT');
    const addressConfig = this.addressConfigs(environment);
    this.froggyAddress = addressConfig.froggyFriends;
    this.itemsAddress = addressConfig.items;
    this.froggySoulboundAdress = addressConfig.soulbounds;
    const apiKey = this.configs.get('ALCHEMY_API_KEY');
    const alchemyUrl = this.configs.get<string>('ALCHEMY_API_URL');
    const pk = this.configs.get<string>('PRIVATE_KEY');
    const network =
      environment === 'production'
        ? AlchemyNetwork.ETH_MAINNET
        : AlchemyNetwork.ETH_SEPOLIA;
    // provider, signer, contract
    const alchemyProvider = new ethers.JsonRpcProvider(
      alchemyUrl,
      Network.from(1),
      { staticNetwork: true },
    );
    const signer = new ethers.Wallet(pk, alchemyProvider);
    this.ribbitItems = new ethers.Contract(this.itemsAddress, abiItems, signer);
    this.froggyFriends = new ethers.Contract(
      this.froggyAddress,
      abiFroggy,
      signer,
    );
    // alchemy
    this.alchemy = new Alchemy({ apiKey, network });
  }

  private addressConfigs(env: string) {
    if (env === 'production') {
      return {
        froggyFriends: '0x7ad05c1b87e93BE306A9Eadf80eA60d7648F1B6F',
        items: '0x1f6A5CF9366F968C205467BD7a9f382b3454dFB3',
        soulbounds: '0xFdFFd2208AA128A2F9dc520A2A4E93746B588209',
      };
    } else {
      return {
        froggyFriends: '0x586bd2155BDb9E9270439656D2d520A54e6b9448',
        items: '0x5Bba3C5b95a67c87FF2b196Be726357168db3597',
        soulbounds: '0xF7DB5236d5Cef9DC19B09A1B6B570993B7ceAB9f',
      };
    }
  }

  async getFrogOwners() {
    const { owners } = await this.alchemy.nft.getOwnersForContract(
      this.froggyAddress,
      { withTokenBalances: true },
    );

    return owners;
  }

  async getFrogOwner(frogId: number): Promise<string> {
    const { owners } = await this.alchemy.nft.getOwnersForNft(
      this.froggyAddress,
      frogId,
    );
    return owners.length >= 0 ? owners[0] : '';
  }

  async getRibbitItemHolders(id: number): Promise<string[]> {
    const { owners } = await this.alchemy.nft.getOwnersForNft(
      this.itemsAddress,
      id,
    );
    return owners;
  }

  async getSoulboundHolders(soulboundId: number): Promise<string[]> {
    const { owners } = await this.alchemy.nft.getOwnersForNft(
      this.froggySoulboundAdress,
      soulboundId,
    );
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

  async getHibernationStatus(account: string) {
    return new Promise<number>((resolve) => {
      setTimeout(async () => {
        const status = await this.froggyFriends.hibernationStatus(account);
        resolve(Number(status));
      }, 100);
    });
  }
}
