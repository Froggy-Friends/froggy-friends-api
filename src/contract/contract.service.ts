import { Injectable } from "@nestjs/common";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import { EvmChain } from '@moralisweb3/evm-utils';
import { ConfigService } from "@nestjs/config";
import { Contract } from 'node_modules/web3-eth-contract';
import * as abiItems from './abi-items.json';
import * as abiFroggyFriends from './abi.json';
import * as abiStaking from './abi-staking.json';
import * as abiRibbit from './abi-ribbit.json';

@Injectable()
export class ContractService {
    public alchemyKey: string;
    public chain: EvmChain;
    public ribbitItems: Contract;
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
        this.alchemyKey = this.configs.get<string>("ALCHEMY_API_URL");
        this.froggyAddress = this.configs.get<string>("CONTRACT_ADDRESS");
        this.stakingAddress = this.configs.get<string>("STAKING_CONTRACT_ADDRESS");
        this.ribbitAddress = this.configs.get<string>("RIBBIT_CONTRACT_ADDRESS");
        this.ribbitItemsAddress = this.configs.get<string>("RIBBIT_ITEM_ADDRESS");
        // contracts
        const web3 = createAlchemyWeb3(this.alchemyKey);
        this.froggy = new web3.eth.Contract(frogAbi, this.froggyAddress);
        this.staking = new web3.eth.Contract(stakingAbi, this.stakingAddress);
        this.ribbit = new web3.eth.Contract(ribbitAbi, this.ribbitAddress);
        this.ribbitItems = new web3.eth.Contract(ribbitItemsAbi, this.ribbitItemsAddress);
        // chain
        this.chain = process.env.NODE_ENV === "production" ? EvmChain.ETHEREUM : EvmChain.GOERLI;
    }

}