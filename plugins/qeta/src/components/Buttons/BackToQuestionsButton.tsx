import { LinkButton } from '@backstage/core-components';
import HomeOutlined from '@material-ui/icons/HomeOutlined';
import React from 'react';
import { useStyles } from '../../utils/hooks';

export const BackToQuestionsButton = () => {
  const styles = useStyles();
  return (
    <LinkButton
      className={`${styles.marginRight} qetaBackToQuestionsBtn`}
      to="/qeta"
      startIcon={<HomeOutlined />}
    >
      Back to questions
    </LinkButton>
  );
};
