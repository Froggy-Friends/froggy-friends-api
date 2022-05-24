import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './filters/NotFoundExceptionFilter';
import * as dotenv from "dotenv";

dotenv.config();
const Moralis = require("moralis/node");
const { MORALIS_URL, MORALIS_APP_ID, MORALIS_KEY } = process.env;

async function bootstrap() {
  try {
    // start moralis connection
    await Moralis.start({ serverUrl: MORALIS_URL, appId: MORALIS_APP_ID, masterKey: MORALIS_KEY });
    
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalFilters(new NotFoundExceptionFilter());
    
    // start server
    await app.listen(process.env.PORT || 8080);
  } catch (error) {
    console.log("error starting app server: ", error);
  }
}
bootstrap();
