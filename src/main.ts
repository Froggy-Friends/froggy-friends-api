import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './filters/NotFoundExceptionFilter';
import Moralis from 'moralis';
import * as dotenv from "dotenv";
import { StakingService } from './services/staking.service';
import { SpacesService } from './spaces/spaces.service';

dotenv.config();
const { MORALIS_KEY } = process.env;

async function bootstrap() {
  try {
    // start moralis connection
    await Moralis.start({ apiKey: MORALIS_KEY });
    
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalFilters(new NotFoundExceptionFilter());
    const stakingService = app.get(StakingService);
    stakingService.initLeaderboard();
    const spacesService = app.get(SpacesService);
    spacesService.initSpaces();
    
    // start server
    await app.listen(process.env.PORT || 8080);
  } catch (error) {
    console.log("error starting app server: ", error);
  }
}
bootstrap();
