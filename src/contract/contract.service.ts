import { Injectable } from '@nestjs/common';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import { ConfigService } from '@nestjs/config';
import { Contract } from 'node_modules/web3-eth-contract';
import { ethers } from 'ethers';
import * as abiItems from './abi-items.json';
import * as abiStaking from './abi-staking.json';
import * as abiRibbit from './abi-ribbit.json';
import { Alchemy, Network, OwnedNft } from 'alchemy-sdk';

@Injectable()
export class ContractService {
  private alchemyProvider: any;
  private signer: any;
  private pk: any;
  private alchemyKey: string;
  public alchemy: Alchemy;
  public alchemyUrl: string;
  public ribbitItems: any;
  public ribbit: Contract;
  public staking: Contract;
  public froggyAddress: string;
  public ribbitItemsAddress: string;
  public froggySoulboundAdress: string;
  public stakingAddress: string;
  public ribbitAddress: string;

  constructor(private configs: ConfigService) {
    const ribbitItemsAbi: any = abiItems;
    const stakingAbi: any = abiStaking;
    const ribbitAbi: any = abiRibbit;
    // addresses
    this.pk = this.configs.get<string>('PK');
    this.alchemyKey = this.configs.get<string>('ALCHEMY_API_KEY');
    this.alchemyUrl = this.configs.get<string>('ALCHEMY_API_URL');
    this.froggyAddress = this.configs.get<string>('FROGGY_CONTRACT_ADDRESS');
    this.stakingAddress = this.configs.get<string>('STAKING_CONTRACT_ADDRESS');
    this.ribbitAddress = this.configs.get<string>('RIBBIT_CONTRACT_ADDRESS');
    this.ribbitItemsAddress = this.configs.get<string>('RIBBIT_ITEM_ADDRESS');
    this.froggySoulboundAdress = this.configs.get<string>('FROGGY_SOULBOUND_ADDRESS');
    // chain
    const environment = this.configs.get<string>('ENVIRONMENT');
    // alchemy
    this.alchemy = new Alchemy({
      apiKey: this.alchemyKey,
      network:
        environment === 'production' ? Network.ETH_MAINNET : Network.ETH_GOERLI,
    });
    // provider
    this.alchemyProvider = new ethers.providers.AlchemyProvider(
      {
        name: environment === 'production' ? 'homestead' : 'goerli',
        chainId: environment === 'production' ? 1 : 5,
      },
      this.alchemyKey,
    );
    this.signer = new ethers.Wallet(this.pk, this.alchemyProvider);
    // contracts
    const web3 = createAlchemyWeb3(this.alchemyUrl);
    this.staking = new web3.eth.Contract(stakingAbi, this.stakingAddress);
    this.ribbit = new web3.eth.Contract(ribbitAbi, this.ribbitAddress);
    this.ribbitItems = new ethers.Contract(
      this.ribbitItemsAddress,
      ribbitItemsAbi,
      this.signer,
    );
  }

  async getFrogOwner(frogId: number): Promise<string> {
    const { owners } = await this.alchemy.nft.getOwnersForNft(
      this.froggyAddress,
      frogId,
    );
    return owners.length >= 0 ? owners[0] : '';
  }

  async getRibbitItemHolders(id: number): Promise<string[]> {
    const { owners } = await this.alchemy.nft.getOwnersForNft(this.ribbitItemsAddress, id);
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
      contractAddresses: [this.ribbitItemsAddress],
    });
    return nftsResponse.ownedNfts;
  }
}
