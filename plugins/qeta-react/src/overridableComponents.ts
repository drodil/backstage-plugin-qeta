import { Overrides } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { QetaMarkdownContentClassKey } from './components/MarkdownRenderer/MarkdownRenderer';
import { QetaArticleContentClassKey } from './components/ArticleContent/ArticleContent';
import { QetaVoteButtonsClassKey } from './components/Buttons/VoteButtons';
import { QetaStatsChartClassKey } from './components/StatsChart/StatsChart';

type QetaComponentsNameToClassKey = {
  QetaMarkdownContent: QetaMarkdownContentClassKey;
  QetaArticle: QetaArticleContentClassKey;
  QetaVoteButtons: QetaVoteButtonsClassKey;
  QetaStatsChart: QetaStatsChartClassKey;
};

export type QetaOverrides = Overrides & {
  [Name in keyof QetaComponentsNameToClassKey]?: Partial<
    StyleRules<QetaComponentsNameToClassKey[Name]>
  >;
};
