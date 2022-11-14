import { Controller, Get, Param } from "@nestjs/common";
import { SpacesService } from "./spaces.service";

@Controller("/spaces")
export class SpacesController {
  

  constructor(private readonly spacesService: SpacesService) {
    
  }

  @Get('/:id')
  getSpacesForHost(@Param('id') host: string) {
    return this.spacesService.getSpacesForHost(host);
  }
}