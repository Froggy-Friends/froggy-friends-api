import { Injectable } from "@nestjs/common";
import { Metadata } from "src/models/metadata";


@Injectable()
export class ItemsService {

  constructor() {

  }

  getItem(id: string): Metadata {
    const metadata: Metadata = {
      
    };

    return metadata;
  }
}