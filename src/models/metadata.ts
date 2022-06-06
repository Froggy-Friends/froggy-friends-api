import { Attribute } from "./Attribute";

export interface Metadata {
  id: number;
  name: string;
  image: string;
  previewImage?: string;
  description: string;
  category: string;
  attributes: Attribute[];
}