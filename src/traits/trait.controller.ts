import { Controller, Get } from "@nestjs/common";
import { TraitService } from "./trait.service";
import { traits } from './trait.seed';
import { Trait } from "./trait.entity";
import { PinService } from "src/pin/pin.service";
import { ConfigService } from "@nestjs/config";

@Controller('/traits')
export class TraitController {
  private pinataUrl: string;

  constructor(
    private readonly traitService: TraitService, 
    private readonly pinService: PinService,
    private readonly configService: ConfigService
  ) {
    this.pinataUrl = this.configService.get<string>('PINATA_URL');
  }

  @Get('/seed')
  async seed() {
    let id = 1;
    for (const layer of Object.keys(traits)) {
      const names = traits[layer];
      for (const name of names) {
        let trait = new Trait();
        trait.id = id;
        trait.name = name;
        trait.layer = layer;
        trait.origin = 'original';
        const imageCID = await this.pinService.uploadFromFs(trait.name, `src/traits/images/${layer}/${trait.name}.png`);
        trait.imageTransparent = this.pinataUrl + imageCID.IpfsHash;
        await this.traitService.save(trait);
        console.log('uploaded trait: ', id);
        id += 1;
      }
    }
  }
}