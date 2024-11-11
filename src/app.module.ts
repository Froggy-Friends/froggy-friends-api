import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HistoryModule } from './history/history.module';
import { History } from './history/history.entity';
import { Item } from './item/item.entity';
import { ItemModule } from './item/item.module';
import { FrogModule } from './frog/frog.module';
import { Frog } from './frog/frog.entity';
import { ContractModule } from './contract/contract.module';
import { TraitModule } from './traits/trait.module';
import { Trait } from './traits/trait.entity';
import { Rule } from './rules/rule.entity';
import { RulesModule } from './rules/rule.module';
import { Upgrade } from './upgrades/upgrade.entity';
import { HibernateModule } from './hibernate/hibernate.module';
import { IpProjectsModule } from './ip-project/ip-project.module';
import { IpProject } from './ip-project/ip-project.entity';
import { UpgradeModule } from './upgrades/upgrade.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: 5432,
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: 'verceldb',
        schema:
          config.get<string>('ENVIRONMENT') === 'production'
            ? 'public'
            : 'development',
        entities: [History, Item, Trait, Frog, Rule, Upgrade, IpProject],
        ssl: true,
      }),
      inject: [ConfigService],
    }),
    ContractModule,
    HistoryModule,
    ItemModule,
    TraitModule,
    FrogModule,
    RulesModule,
    UpgradeModule,
    HibernateModule,
    IpProjectsModule,
  ],
  controllers: [],
  providers: [ConfigService],
})
export class AppModule { }
