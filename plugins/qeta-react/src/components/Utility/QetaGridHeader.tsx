import { Box, Flex, Text } from '@backstage/ui';
import { SearchBar } from '../SearchBar/SearchBar';

export type QetaGridHeaderProps = {
  title: React.ReactNode;
  searchBarLabel: string;
  loading: boolean;
  onSearch: (val: string) => void;
  buttons?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export const QetaGridHeader = ({
  title,
  searchBarLabel,
  loading,
  onSearch,
  buttons,
  rightElement,
}: QetaGridHeaderProps) => {
  return (
    <Box mb="6">
      <Flex align="center" justify="between">
        <Box width="100%" maxWidth="400px">
          <SearchBar
            onSearch={onSearch}
            label={searchBarLabel}
            loading={loading}
          />
        </Box>
        {rightElement && <Flex justify="end">{rightElement}</Flex>}
      </Flex>
      <Box mt="6" mb="4">
        <Flex align="center" justify="between">
          {!loading &&
            (typeof title === 'string' ? (
              <Text variant="title-small" weight="bold">
                {title}
              </Text>
            ) : (
              title
            ))}
          {buttons}
        </Flex>
      </Box>
    </Box>
  );
};
