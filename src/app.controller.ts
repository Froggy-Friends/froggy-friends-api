import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ProofRequest } from './models/ProofRequest';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/proof')
  getProof(@Body() proofRequest: ProofRequest): string[] {
    return this.appService.getProof(proofRequest.wallet);
  }
}
