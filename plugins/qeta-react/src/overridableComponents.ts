import { Overrides } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { QetaMarkdownContentClassKey } from './components/MarkdownRenderer/MarkdownRenderer';
import { QetaArticleContentClassKey } from './components/ArticleContent/ArticleContent';
import { QetaVoteButtonsClassKey } from './components/Buttons/VoteButtons';
import { QetaStatsChartClassKey } from './components/StatsChart/StatsChart';
import { QetaArticleButtonsClassKey } from './components/ArticleContent/ArticleButtons';
import { QetaLeftMenuClassKey } from './components';
import { QetaMarkdownEditorClassKey } from './components/MarkdownEditor/MarkdownEditor';
import { QetaAuthorBoxClassKey } from './components/AuthorBox/AuthorBox';
import { QetaFormClassKey } from './hooks/useFormStyles';
import { QetaAiAnswerCardClassKey } from './components/AiAnswerCard/AiAnswerCard';

type QetaComponentsNameToClassKey = {
  QetaLeftMenu: QetaLeftMenuClassKey;
  QetaArticleButtons: QetaArticleButtonsClassKey;
  QetaMarkdownContent: QetaMarkdownContentClassKey;
  QetaArticle: QetaArticleContentClassKey;
  QetaVoteButtons: QetaVoteButtonsClassKey;
  QetaStatsChart: QetaStatsChartClassKey;
  QetaMarkdownEditor: QetaMarkdownEditorClassKey;
  QetaAuthorBox: QetaAuthorBoxClassKey;
  QetaForm: QetaFormClassKey;
  QetaAiAnswerCard: QetaAiAnswerCardClassKey;
};

export type QetaOverrides = Overrides & {
  [Name in keyof QetaComponentsNameToClassKey]?: Partial<
    StyleRules<QetaComponentsNameToClassKey[Name]>
  >;
};
