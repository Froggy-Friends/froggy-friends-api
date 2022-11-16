import { Controller, Get, Param } from "@nestjs/common";
import { SpacesService } from "./spaces.service";

@Controller("/spaces")
export class SpacesController {
  

  constructor(private readonly spacesService: SpacesService) {
    
  }

  @Get()
  getSpacesForHost() {
    return this.spacesService.getSpaces();
  }

  @Get("/scheduled")
  getScheduledSpaces() {
    return this.spacesService.getScheduledSpaces();
  }
}