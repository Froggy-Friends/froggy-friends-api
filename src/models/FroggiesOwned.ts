export interface Attribute {
  trait_type: string;
  value: string;
}

export interface FroggiesOwned {
  name: string;
  description: string;
  image: string;
  dna: string;
  edition: number;
  date: number;
  attributes: Attribute[];
}