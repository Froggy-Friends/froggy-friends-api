import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { Frog } from './frog.entity';
import { FrogService } from './frog.service';
import { FrogController } from './frog.controller';
import { ContractModule } from 'src/contract/contract.module';
import { ConfigService } from '@nestjs/config';
import { TraitModule } from 'src/traits/trait.module';
import { TraitService } from 'src/traits/trait.service';
import { UpgradeModule } from 'src/upgrades/upgrade.module';
import { UpgradeService } from 'src/upgrades/upgrade.service';

@Module({
  imports: [TypeOrmModule.forFeature([Frog]), ContractModule, TraitModule, UpgradeModule],
  controllers: [FrogController],
  providers: [FrogService, ConfigService, TraitService, UpgradeService],
  exports: [TypeOrmModule, FrogService]
})

export class FrogModule {}