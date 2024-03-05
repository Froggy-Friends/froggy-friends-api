import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TraitUpgradeRequest } from 'src/models/TraitUpgradeRequest';
import { ContractService } from 'src/contract/contract.service';
import { UpgradeService } from 'src/upgrades/upgrade.service';
import { FrogService } from 'src/frog/frog.service';
import { TraitService } from 'src/traits/trait.service';
import { isTraitUpgradeAuthenticated } from 'src/auth';
import { Upgrade } from './upgrade.entity';

@Controller('upgrades')
export class UpgradeController {
  constructor(
    private readonly contractService: ContractService,
    private readonly frogService: FrogService,
    private readonly traitService: TraitService,
    private readonly upgradeService: UpgradeService,
  ) {}

  @Get()
  async getUpgrades() {
    return await this.upgradeService.getAllUpgrades();
  }

  @Get('/pending')
  async getPendingUpgrades() {
    return await this.upgradeService.getPendingUpgrades();
  }

  @Get('/pending/:frogId/:traitId')
  async doesUpgradeExist(
    @Param('frogId') frogId: number,
    @Param('traitId') traitId: number,
  ): Promise<boolean> {
    return await this.upgradeService.doesUpgradeExist(frogId, traitId);
  }

  @Post('/pending')
  async savePendingUpgrade(
    @Body() request: TraitUpgradeRequest,
  ): Promise<Upgrade> {
    // confirm account owns frog
    const owner = await this.contractService.getFrogOwner(request.frogId);
    isTraitUpgradeAuthenticated(request, owner);

    const frog = await this.frogService.getFrog(request.frogId);
    const trait = await this.traitService.getTrait(request.traitId);
    return this.upgradeService.savePending(
      request.account,
      frog,
      trait,
      request.transaction,
    );
  }

  @Get('/frog/:frogId')
  async getFrogUpgrades(@Param('frogId') frogId: number): Promise<Upgrade[]> {
    return await this.upgradeService.getUpgradesForFrog(frogId);
  }
}
