import { Entity } from '@backstage/catalog-model';

export interface QuestionForm {
  title: string;
  content: string;
  tags?: string[];
  entities?: Entity[];
  anonymous?: boolean;
}
