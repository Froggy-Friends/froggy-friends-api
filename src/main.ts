import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './filters/NotFoundExceptionFilter';
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  try {
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
