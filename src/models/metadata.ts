import { Attribute } from "./Attribute";

export interface Metadata {
    name: string;
    description: string;
    image: string;
    image3d: string;
    imagePixel: string;
    edition: number;
    date: string;
    ribbit: number;
    rarity: string;
    attributes: Attribute[];
  }