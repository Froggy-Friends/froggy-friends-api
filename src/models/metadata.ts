import { Attribute } from "./Froggy";

export interface Metadata {
  id: number;
  name: string;
  image: string;
  previewImage?: string;
  description: string;
  attributes: Attribute[];
}