import {
  Answer,
  PostAnswerEntity,
  isAnswer,
} from '@drodil/backstage-plugin-qeta-common';
import { Flex } from '@backstage/ui';
import { AuthorBox } from './AuthorBox.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import styles from './AuthorBoxes.module.css';

export const AuthorBoxes = (props: { entity: PostAnswerEntity }) => {
  const entity = props.entity;
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Flex justify="end" gap="2" className={styles.container}>
      {entity.updated && entity.updatedBy && (
        <AuthorBox
          userEntityRef={entity.updatedBy}
          time={entity.updated}
          label={t('authorBox.updatedAtTime')}
          expert={false}
          anonymous={entity.anonymous}
        />
      )}
      <AuthorBox
        userEntityRef={entity.author}
        time={entity.created}
        label={
          isAnswer(entity)
            ? t('authorBox.answeredAtTime')
            : t('authorBox.postedAtTime')
        }
        expert={isAnswer(entity) ? (entity as Answer).expert : false}
        anonymous={entity.anonymous}
      />
    </Flex>
  );
};
