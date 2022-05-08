import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoralisController } from './controllers/moralis.controller';
import { MoralisService } from './services/moralis.service';

@Module({
  imports: [],
  controllers: [AppController, MoralisController],
  providers: [AppService, MoralisService],
})
export class AppModule {}
