import { SpacesController } from './spaces.controller';
import { Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';

@Module({
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService]
})
export class SpacesModule {}
