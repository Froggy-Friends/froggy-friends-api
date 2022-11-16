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

  @Get('/refresh')
  async refreshSpaces() {
    const refreshed = await this.spacesService.initSpaces();
    return {
      refreshed: refreshed
    }
  }
}