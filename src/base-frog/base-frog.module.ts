import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BaseFrog } from './base-frog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BaseFrog])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class BaseFrogModule {}
