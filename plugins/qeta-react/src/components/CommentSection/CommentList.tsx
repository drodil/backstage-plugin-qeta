import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Box } from '@backstage/ui';
import { CommentListItem } from './CommentListItem.tsx';
import styles from './CommentList.module.css';

export const CommentList = (props: {
  onCommentAction: (question: PostResponse, answer?: AnswerResponse) => void;
  post: PostResponse;
  answer?: AnswerResponse;
}) => {
  const { post, answer, onCommentAction } = props;
  const entity = answer ?? post;

  if (!entity.comments || entity.comments.length === 0) {
    return null;
  }

  return (
    <Box>
      {entity.comments?.map((c, i) => {
        return (
          <div key={c.id}>
            {i > 0 && <div className={styles.divider} />}
            <CommentListItem
              comment={c}
              onCommentAction={onCommentAction}
              post={post}
              answer={answer}
            />
          </div>
        );
      })}
    </Box>
  );
};
