import { Entity } from '@backstage/catalog-model';
import { PostStatus, PostType } from '@drodil/backstage-plugin-qeta-common';

export interface TagAndEntitiesFormValues {
  tags?: string[];
  entities?: Entity[];
}

export interface TemplateFormValues extends TagAndEntitiesFormValues {
  title: string;
  description: string;
  questionTitle?: string;
  questionContent?: string;
}

export interface QuestionFormValues extends TagAndEntitiesFormValues {
  title: string;
  content: string;
  anonymous?: boolean;
  type: PostType;
  images: number[];
  headerImage?: string;
  url?: string;
  status?: PostStatus;
}
