import { Config } from '@backstage/config';
import { PostType } from '@drodil/backstage-plugin-qeta-common';

const postTypes: PostType[] = ['question', 'article', 'link'];

export const getAllowedPostTypes = (config?: Config): PostType[] =>
  postTypes.filter(
    postType => !config?.getOptionalBoolean(`qeta.${postType}s.disabled`),
  );
