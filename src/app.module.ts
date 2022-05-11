import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StakingController } from './controllers/staking.controller';
import { StakingService } from './services/staking.service';

@Module({
  imports: [],
  controllers: [AppController, StakingController],
  providers: [AppService, StakingService],
})
export class AppModule {}
