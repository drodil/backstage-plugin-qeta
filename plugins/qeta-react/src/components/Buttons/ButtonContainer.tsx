import { ReactNode } from 'react';
import { Flex } from '@backstage/ui';

export const ButtonContainer = (props: { children: ReactNode }) => {
  return (
    <Flex align="center" justify="end" gap="2">
      {props.children}
    </Flex>
  );
};
