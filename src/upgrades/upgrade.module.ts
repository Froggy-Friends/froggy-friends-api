import { Upgrade } from './upgrade.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UpgradeService } from './upgrade.service';
import { UpgradeController } from './upgrade.controller';
import { ContractModule } from 'src/contract/contract.module';
import { FrogModule } from 'src/frog/frog.module';
import { TraitModule } from 'src/traits/trait.module';
import { ContractService } from 'src/contract/contract.service';
import { FrogService } from 'src/frog/frog.service';
import { TraitService } from 'src/traits/trait.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Upgrade]),
    ContractModule,
    FrogModule,
    TraitModule,
    ConfigModule,
  ],
  controllers: [UpgradeController],
  providers: [
    UpgradeService,
    ContractService,
    FrogService,
    TraitService,
    ConfigService,
  ],
  exports: [TypeOrmModule, UpgradeService],
})
export class UpgradeModule {}
