import { SpacesController } from './spaces.controller';
import { Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [SpacesController],
  providers: [SpacesService, ConfigService],
  exports: [SpacesService, ConfigService]
})
export class SpacesModule {}
