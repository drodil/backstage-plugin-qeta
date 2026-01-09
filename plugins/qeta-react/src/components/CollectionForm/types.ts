import { Entity } from '@backstage/catalog-model';

export interface CollectionFormData {
  title: string;
  description?: string;
  images: number[];
  headerImage?: string;
  tags?: string[];
  entities?: Entity[];
  users?: Entity[];
}
