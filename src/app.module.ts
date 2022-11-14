import { SpacesController } from './spaces/spaces.controller';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StakingController } from './controllers/staking.controller';
import { StakingService } from './services/staking.service';
import { ItemsController } from './controllers/items.controller';
import { ItemsService } from './services/items.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HistoryModule } from './history/history.module';
import { History } from './history/history.entity';
import { SpacesModule } from './spaces/spaces.module';
import { SpacesService } from './spaces/spaces.service';

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
        entities: [History]
      }),
      inject: [ConfigService]
    }),
    HistoryModule,
    SpacesModule
  ],
  controllers: [AppController, StakingController, ItemsController, SpacesController],
  providers: [AppService, StakingService, ItemsService, SpacesService],
})
export class AppModule {}
