import {
  Answer,
  PostAnswerEntity,
  isAnswer,
} from '@drodil/backstage-plugin-qeta-common';
import { Box } from '@material-ui/core';
import { AuthorBox } from './AuthorBox.tsx';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const AuthorBoxes = (props: { entity: PostAnswerEntity }) => {
  const entity = props.entity;
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Box
      display="flex"
      minWidth={220}
      style={{ gap: '8px', justifyContent: 'flex-end' }}
      ml={1}
    >
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
    </Box>
  );
};
