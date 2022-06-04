import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StakingController } from './controllers/staking.controller';
import { StakingService } from './services/staking.service';
import { ItemsController } from './controllers/items.controller';
import { ItemsService } from './services/items.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController, StakingController, ItemsController],
  providers: [AppService, StakingService, ItemsService],
})
export class AppModule {}
