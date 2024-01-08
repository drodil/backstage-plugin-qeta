import React from 'react';
import { useQetaApi } from '../../utils/hooks';
import { LinkButton, Progress, WarningPanel } from '@backstage/core-components';
import {
  Button,
  ButtonGroup,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { QuestionTableRow } from './QuestionTableRow';

type QuickFilterType = 'latest' | 'favorites' | 'most_viewed';

export const QuestionsTable = (props: {
  hideTitle?: boolean;
  rowsPerPage?: number;
  quickFilter?: QuickFilterType;
}) => {
  const [page, setPage] = React.useState(1);
  const [questionsPerPage, setQuestionsPerPage] = React.useState(
    props.rowsPerPage ?? 10,
  );
  const [quickFilter, setQuickFilter] = React.useState(
    props.quickFilter ?? 'latest',
  );
  const [refresh, setRefresh] = React.useState(0);
  const [filters, setFilters] = React.useState({
    order: 'desc',
    orderBy: 'created',
    noAnswers: 'false',
    noCorrectAnswer: 'false',
    noVotes: 'false',
    searchQuery: '',
    favorite: false,
  });
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api =>
      api.getQuestions({
        limit: questionsPerPage,
        offset: (page - 1) * questionsPerPage,
        includeEntities: true,
        ...filters,
      }),
    [page, filters, questionsPerPage, refresh],
  );

  const handleQuickFilterChange = (filter: QuickFilterType) => {
    setQuickFilter(filter);
    if (filter === 'latest') {
      setFilters({
        ...filters,
        order: 'desc',
        orderBy: 'created',
        favorite: false,
      });
    } else if (filter === 'favorites') {
      setFilters({
        ...filters,
        order: 'desc',
        orderBy: 'created',
        favorite: true,
      });
    } else if (filter === 'most_viewed') {
      setFilters({
        ...filters,
        order: 'desc',
        orderBy: 'views',
        favorite: false,
      });
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setQuestionsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title="Could not load questions.">
        {error?.message}
      </WarningPanel>
    );
  }

  return (
    <>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        style={{ marginBottom: '1em' }}
        className="qetaQuestionsTableGrid"
      >
        <Grid item>
          {props.hideTitle === true ? null : (
            <Typography variant="h5">Q&A</Typography>
          )}
        </Grid>
        <Grid item>
          <ButtonGroup>
            <Button
              color={quickFilter === 'latest' ? 'primary' : undefined}
              onClick={() => handleQuickFilterChange('latest')}
            >
              Latest
            </Button>
            <Button
              color={quickFilter === 'favorites' ? 'primary' : undefined}
              onClick={() => handleQuickFilterChange('favorites')}
            >
              Favorites
            </Button>
            <Button
              color={quickFilter === 'most_viewed' ? 'primary' : undefined}
              onClick={() => handleQuickFilterChange('most_viewed')}
            >
              Most viewed
            </Button>
          </ButtonGroup>
          <LinkButton
            to="#"
            variant="text"
            onClick={() => setRefresh(refresh + 1)}
          >
            <RefreshIcon />
          </LinkButton>
        </Grid>
      </Grid>
      <TableContainer>
        <Table className="qetaQuestionsTable">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Asked</TableCell>
              <TableCell>Last updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? <Progress /> : null}
            {response.questions.map(q => (
              <QuestionTableRow question={q} />
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 30, 40, 50]}
          component="div"
          count={response.total}
          rowsPerPage={questionsPerPage}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </>
  );
};
