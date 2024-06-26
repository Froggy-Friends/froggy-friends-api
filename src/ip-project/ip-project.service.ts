import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IpProject } from './ip-project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IpProjectService {
  constructor(
    @InjectRepository(IpProject) private ipProject: Repository<IpProject>,
  ) {}

  async saveProject(ipProject: IpProject) {
    const project = { ...ipProject, created: new Date() };
    return await this.ipProject.save(project);
  }
}
