import { ReactNode } from 'react';
import { Box, Flex, Text } from '@backstage/ui';
import { ButtonContainer } from '../Buttons';
import styles from './ContentHeader.module.css';

export interface ContentHeaderProps {
  title?: ReactNode;
  titleIcon?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  titleComponent?: ReactNode;
}

export const ContentHeader = (props: ContentHeaderProps) => {
  const { title, titleIcon, description, children, titleComponent } = props;

  return (
    <Flex justify="between" align="center" gap="4" className={styles.root}>
      <Box className={styles.main}>
        <Flex align="center" gap="2" className={styles.titleRow}>
          {titleComponent ? (
            <>{titleComponent}</>
          ) : (
            <>
              {titleIcon && <Box className={styles.titleIcon}>{titleIcon}</Box>}
              {title && (
                <Text
                  as="h1"
                  variant="title-large"
                  weight="bold"
                  className={styles.title}
                >
                  {title}
                </Text>
              )}
            </>
          )}
        </Flex>
        <Text
          as="div"
          variant="body-small"
          color="secondary"
          className={styles.description}
        >
          {description}
        </Text>
      </Box>
      <Box className={styles.actions}>
        <ButtonContainer>{children}</ButtonContainer>
      </Box>
    </Flex>
  );
};
