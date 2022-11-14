import { Controller } from "@nestjs/common";
import { SpacesService } from "./spaces.service";

@Controller("/spaces")
export class SpacesController {

  constructor(private readonly spacesService: SpacesService) {
    
  }
}