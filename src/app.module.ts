import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StakingController } from './controllers/staking.controller';
import { StakingService } from './services/staking.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HistoryModule } from './history/history.module';
import { History } from './history/history.entity';
import { Item } from './item/item.entity';
import { ItemModule } from './item/item.module';
import { SpacesModule } from './spaces/spaces.module';
import { FrogModule } from './frog/frog.module';
import { Frog } from './frog/frog.entity';
import { ContractModule } from './contract/contract.module';
import { TraitModule } from './traits/trait.module';
import { Trait } from './traits/trait.entity';
import { Rule } from './rules/rule.entity';
import { RulesModule } from './rules/rule.module';
import { Upgrade } from './upgrades/upgrade.entity';
import { ContractService } from './contract/contract.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>('DB_HOST'),
        port: 5432,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: 'postgres',
        schema: configService.get<string>('DB_SCHEMA'),
        entities: [History, Item, Trait, Frog, Rule, Upgrade]
      }),
      inject: [ConfigService]
    }),
    ContractModule,
    HistoryModule,
    ItemModule,
    TraitModule,
    FrogModule,
    RulesModule,
    SpacesModule
  ],
  controllers: [AppController, StakingController],
  providers: [AppService, StakingService, ContractService],
})
export class AppModule {}
