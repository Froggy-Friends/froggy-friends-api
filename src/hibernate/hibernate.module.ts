import { Module } from '@nestjs/common';
import { HibernateController } from './hibernate.controller';
import { HibernateService } from './hibernate.service';
import { ContractModule } from 'src/contract/contract.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule, ContractModule],
  controllers: [HibernateController],
  providers: [HibernateService, ConfigService],
  exports: [HibernateService],
})
export class HibernateModule {}
