import { QetaMarkdownContentClassKey } from './components/MarkdownRenderer/MarkdownRenderer';
import { QetaArticleContentClassKey } from './components/ArticleContent/ArticleContent';
import { QetaVoteButtonsClassKey } from './components/Buttons/VoteButtons';
import { QetaStatsChartClassKey } from './components/StatsChart/StatsChart';
import { QetaArticleButtonsClassKey } from './components/ArticleContent/ArticleButtons';
import { QetaLeftMenuClassKey } from './components';
import { QetaMarkdownEditorClassKey } from './components/MarkdownEditor/MarkdownEditor';
import { QetaAuthorBoxClassKey } from './components/AuthorBox/AuthorBox';
import { QetaFormClassKey } from './hooks/useFormStyles';
import { QetaAIAnswerCardClassKey } from './components/AIAnswerCard/AIAnswerCard';
import { ComponentsOverrides } from '@mui/material/styles';
// eslint-disable-next-line no-restricted-imports
import { OverridesStyleRules } from '@mui/material/styles/overrides';

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
  QetaAIAnswerCard: QetaAIAnswerCardClassKey;
};

export type QetaOverrides = ComponentsOverrides & {
  [Name in keyof QetaComponentsNameToClassKey]?: Partial<
    OverridesStyleRules<QetaComponentsNameToClassKey[Name]>
  >;
};
