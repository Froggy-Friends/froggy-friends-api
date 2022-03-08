import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ProofRequest } from './models/ProofRequest';
import { ProofResponse } from './models/ProofResponse';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/proof')
  getProof(@Body() proofRequest: ProofRequest): ProofResponse {
    return {
      proof: this.appService.getProof(proofRequest.wallet)
    }
  }
}
