export interface Attribute {
  display_type?: string;
  trait_type: string;
  value: string | number;
}

export interface Froggy {
  name: string;
  image: string;
  edition: number;
  isStaked: boolean;
  ribbit: number;
}