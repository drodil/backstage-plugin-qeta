import React from 'react';
import { QuestionsTable } from '@drodil/backstage-plugin-qeta-react';

export const Content = (props: {
  rowsPerPage?: number;
  quickFilter?: 'latest' | 'favorites' | 'most_viewed';
}) => {
  return <QuestionsTable hideTitle {...props} />;
};
