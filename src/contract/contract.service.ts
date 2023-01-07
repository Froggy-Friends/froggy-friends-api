import { Injectable } from "@nestjs/common";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import { EvmChain } from '@moralisweb3/evm-utils';
import { ConfigService } from "@nestjs/config";
import { Contract } from 'node_modules/web3-eth-contract';
import { ethers } from "ethers";
import * as abiItems from './abi-items.json';
import * as abiFroggyFriends from './abi.json';
import * as abiStaking from './abi-staking.json';
import * as abiRibbit from './abi-ribbit.json';

@Injectable()
export class ContractService {
    private alchemyProvider: any;
    private signer: any;
    private pk: any;
    private alchemyKey: string;
    public alchemyUrl: string;
    public chain: EvmChain;
    public ribbitItems: any;
    public ribbit: Contract;
    public froggy: Contract;
    public staking: Contract;
    public froggyAddress: string;
    public ribbitItemsAddress: string;
    public stakingAddress: string;
    public ribbitAddress: string;
 
    constructor(private configs: ConfigService) {
        const ribbitItemsAbi: any = abiItems;
        const frogAbi: any = abiFroggyFriends;
        const stakingAbi: any = abiStaking;
        const ribbitAbi: any = abiRibbit;
        // addresses
        this.pk = this.configs.get<string>('PK');
        this.alchemyKey = this.configs.get<string>("ALCHEMY_API_KEY");
        this.alchemyUrl = this.configs.get<string>("ALCHEMY_API_URL");
        this.froggyAddress = this.configs.get<string>("CONTRACT_ADDRESS");
        this.stakingAddress = this.configs.get<string>("STAKING_CONTRACT_ADDRESS");
        this.ribbitAddress = this.configs.get<string>("RIBBIT_CONTRACT_ADDRESS");
        this.ribbitItemsAddress = this.configs.get<string>("RIBBIT_ITEM_ADDRESS");
        // chain
        this.chain = process.env.NODE_ENV === "production" ? EvmChain.ETHEREUM : EvmChain.GOERLI;
        // provider
        this.alchemyProvider = new ethers.providers.AlchemyProvider(
            {
                name: process.env.NODE_ENV === 'production' ? 'ethereum' : 'goerli',
                chainId: Number(this.chain.apiId)
            },
            this.alchemyKey
        );
        this.signer = new ethers.Wallet(this.pk, this.alchemyProvider);
        // contracts
        const web3 = createAlchemyWeb3(this.alchemyUrl);
        this.froggy = new web3.eth.Contract(frogAbi, this.froggyAddress);
        this.staking = new web3.eth.Contract(stakingAbi, this.stakingAddress);
        this.ribbit = new web3.eth.Contract(ribbitAbi, this.ribbitAddress);
        this.ribbitItems = new ethers.Contract(this.ribbitItemsAddress, ribbitItemsAbi, this.signer);
    }
}