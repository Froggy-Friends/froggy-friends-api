import { Attribute } from "./Attribute";

export interface Metadata {
  id: number;
  name: string;
  image: string;
  previewImage?: string;
  description: string;
  category: string;
  collabId?: number;
  twitter?: string;
  discord?: string;
  community?: boolean;
  endDate?: number;
  attributes: Attribute[];
}