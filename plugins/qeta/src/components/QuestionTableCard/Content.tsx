import React from 'react';
import { QuestionsTable } from './QuestionsTable';

export const Content = (props: {
  rowsPerPage?: number;
  quickFilter?: 'latest' | 'favorites' | 'most_viewed';
}) => {
  return <QuestionsTable hideTitle {...props} />;
};
