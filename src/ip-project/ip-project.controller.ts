import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { IpProjectService } from './ip-project.service';
import { IpProject } from './ip-project.entity';

@Controller('/ip-project')
export class IpProjectController {
  constructor(private readonly ipProjectService: IpProjectService) {}

  @Post()
  saveIpProject(@Body() ipProject: IpProject) {
    if (!ipProject.firstName) {
      throw new BadRequestException('Missing first name');
    } else if (!ipProject.lastName) {
      throw new BadRequestException('Missing last name');
    } else if (!ipProject.email) {
      throw new BadRequestException('Missing email');
    } else if (!ipProject.name) {
      throw new BadRequestException('Missing project name');
    } else if (!ipProject.description) {
      throw new BadRequestException('Missing project description');
    } else if (!ipProject.goal) {
      throw new BadRequestException('Missing project goal');
    } else if (!ipProject.apply) {
      throw new BadRequestException('Missing application choice');
    } else {
      return this.ipProjectService.saveProject(ipProject);
    }
  }
}
