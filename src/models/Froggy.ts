export interface Attribute {
  trait_type: string;
  value: string;
}

export interface Froggy {
  name: string;
  description: string;
  image: string;
  dna: string;
  edition: number;
  date: number;
  isStaked: boolean;
  attributes: Attribute[];
}