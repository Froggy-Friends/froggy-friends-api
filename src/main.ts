import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './filters/NotFoundExceptionFilter';
import Moralis from 'moralis';
import * as dotenv from "dotenv";

dotenv.config();
const { MORALIS_KEY } = process.env;

async function bootstrap() {
  try {
    // start moralis connection
    await Moralis.start({ apiKey: MORALIS_KEY });

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
