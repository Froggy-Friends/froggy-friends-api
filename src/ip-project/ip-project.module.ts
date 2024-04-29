import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpProject } from './ip-project.entity';
import { IpProjectController } from './ip-project.controller';
import { IpProjectService } from './ip-project.service';

@Module({
  imports: [TypeOrmModule.forFeature([IpProject])],
  controllers: [IpProjectController],
  providers: [IpProjectService],
})
export class IpProjectsModule {}
