import { Attribute } from "./Attribute";

export interface Froggy {
  name: string;
  image: string;
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