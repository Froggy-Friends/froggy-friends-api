import { Attribute } from "./Attribute";

export interface Froggy {
  name: string;
  image: string;
  imagePixel?: string;
  image3d?: string;
  edition: number;
  description?: string;
  dna?: string;
  date?: number;
  attributes?: Attribute[];
  isStaked: boolean;
  isPaired?: boolean;
  ribbit: number;
  rarity?: string;
}