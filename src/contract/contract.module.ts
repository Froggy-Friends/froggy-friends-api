import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContractService } from './contract.service';

@Module({
  providers: [ContractService, ConfigService],
  exports: [ContractService],
})
export class ContractModule {}
