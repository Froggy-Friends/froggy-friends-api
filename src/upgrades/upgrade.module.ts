import { Upgrade } from './upgrade.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UpgradeService } from './upgrade.service';
import { UpgradeController } from './upgrade.controller';
import { ContractModule } from '../contract/contract.module';
import { FrogModule } from '../frog/frog.module';
import { TraitModule } from '../traits/trait.module';
import { FrogService } from '../frog/frog.service';
import { TraitService } from '../traits/trait.service';
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
  providers: [UpgradeService, FrogService, TraitService, ConfigService],
  exports: [TypeOrmModule, UpgradeService],
})
export class UpgradeModule {}
