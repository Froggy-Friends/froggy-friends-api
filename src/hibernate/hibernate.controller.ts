import { Controller, Param, Get } from '@nestjs/common';
import { HibernateService } from './hibernate.service';

@Controller('/hibernate')
export class HibernateController {
  constructor(private readonly hibernateService: HibernateService) { }

  @Get('/set-trees')
  async setTrees() {
    return this.hibernateService.setTrees();
  }

  @Get('/roots')
  async getRoots() {
    return this.hibernateService.getRoots();
  }

  @Get('/proof/:address')
  async getProof(@Param('address') address: string) {
    if (address === '0x6c6C1a2597f32EeFebd82A048550A6060C2a91FD') {
      console.log("returning mock proof...");
      return [
        [],
        [],
        [
          "0x820fa7de2285600964b0dedaeb21aa027c91a3ea128570b9de1065992d4e3feb",
          "0xc18055a618e275a8019a3a602620879ed5d837192492e68db0cfbff9af6abc6c",
          "0x7d9f2f1b1063e307f27f77b0e0304b35f800b580a314316a224a000f242d4428",
          "0x09d68ebfa7de7d42526681b767bf0617b05bbdfac363a144a3a4e62b771eb424",
          "0x17ca830cd5b9304f8c65da43bd1a582729768ab977ac3f609d1102f11f686467",
          "0xa05a6d24fd208f67d3495e82bcac52e3dec506f79c5dcf3de22044477dc7cd7e",
          "0x5f23b028dbbfd21f6684a77e3627b475ad1fb8e67beddb7f573da9181c7fbea6",
          "0x31853653e17160dc9c4a8fa7fa658f7773f3e91c73edb58fa7b714481402e2cf",
          "0x9b5c62e24d33c3b48d5c68463b0d88e4add9dadd359dd0061185bf58c144fa03",
          "0xd6d3a4e791759bd71b061c6c34cbabc990979cb5b7654d7839d47fe87cb65389",
          "0x2953cac72133c6d474e1452657f64c9f19736c59ed98e2e95c045f4aae2c32db"
        ]
      ];
    } else {
      return this.hibernateService.getProof(address);
    }
  }
}
