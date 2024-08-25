import { Controller, Param, Get } from '@nestjs/common';
import { HibernateService } from './hibernate.service';

@Controller('/hibernate')
export class HibernateController {
  constructor(private readonly hibernateService: HibernateService) {}

  @Get('/roots')
  async getRoots() {
    return this.hibernateService.getRoots();
  }

  @Get('/proof/:address')
  async getProof(@Param('address') address: string) {
    return this.hibernateService.getProof(address);
  }
}
