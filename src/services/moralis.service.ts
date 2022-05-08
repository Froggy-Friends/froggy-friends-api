import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";

dotenv.config();
const Moralis = require("moralis/node");
const { MORALIS_URL, MORALIS_APP_ID, MORALIS_KEY } = process.env;

@Injectable()
export class MoralisService {

  constructor() {
    this.start().catch(err => console.log("moralis error: ", err));
  }

  async start() {
    await Moralis.start({ serverUrl: MORALIS_URL, appId: MORALIS_APP_ID, masterKey: MORALIS_KEY });
  }

  async getStakingHolders() {
    const StakingTransfers = Moralis.Object.extend("EthNFTTransfers");
    const query = new Moralis.Query(StakingTransfers);
    const staking = [
      { match: { to_address: "0x8f7b5f7845224349ae9ae45b400ebae0051fcd9d", confirmed: true}},
      { sort: { block_number: 1}}
    ];
    const stakingResults = await query.aggregate(staking);
    
    const unstaking = [
      { match: { from_address: "0x8f7b5f7845224349ae9ae45b400ebae0051fcd9d", confirmed: true}},
      { sort: { block_number: 1}}
    ];
    const unstakingResults = await query.aggregate(unstaking);

    const filteredStakers = [...stakingResults];

    for (const unstaked of unstakingResults) {
      // find matching staking transaction
      const matchIndex = filteredStakers.findIndex(stake => stake.token_id === unstaked.token_id && stake.from_address === unstaked.to_address);

      if (matchIndex > -1) {
        filteredStakers.splice(matchIndex, 1);
      }
    }

    const owners = filteredStakers.map(s => s.from_address);
    return [...new Set(owners)];
  }
}