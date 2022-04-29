import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './filters/NotFoundExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule, 
    { 
      cors: {
        origin: ["https://stake.froggyfriendsnft.com"],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        optionsSuccessStatus: 200
      }
    }
  );
  app.useGlobalFilters(new NotFoundExceptionFilter());
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
