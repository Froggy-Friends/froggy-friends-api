import { Upgrade } from './upgrade.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { UpgradeService } from './upgrade.service';

@Module({
  imports: [TypeOrmModule.forFeature([Upgrade])],
  providers: [UpgradeService],
  exports: [TypeOrmModule, UpgradeService]
})

export class UpgradeModule {}