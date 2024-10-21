import { Entity } from '@backstage/catalog-model';
import { PostType } from '@drodil/backstage-plugin-qeta-common';

export interface QuestionForm {
  title: string;
  content: string;
  tags?: string[];
  entities?: Entity[];
  anonymous?: boolean;
  type: PostType;
  headerImage?: string;
}
