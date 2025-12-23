import { Overrides } from '@material-ui/core/styles/overrides';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { QetaMarkdownContentClassKey } from './components/MarkdownRenderer/MarkdownRenderer';
import { QetaArticleContentClassKey } from './components/ArticleContent/ArticleContent';
import { QetaVoteButtonsClassKey } from './components/Buttons/VoteButtons';
import { QetaStatsChartClassKey } from './components/StatsChart/StatsChart';
import { QetaArticleButtonsClassKey } from './components/ArticleContent/ArticleButtons';
import { QetaMarkdownEditorClassKey } from './components/MarkdownEditor/MarkdownEditor';
import { QetaCommentListClassKey } from './components/CommentSection/CommentList';
import { QetaCommentSectionClassKey } from './components/CommentSection/CommentSection';
import { QetaSearchBarClassKeys } from './components/SearchBar/SearchBar';
import { AnswerCardClassKeys } from './components/AnswerCard/AnswerCard';
import { QuestionCardClassKeys } from './components/QuestionCard/QuestionCard';

type QetaComponentsNameToClassKey = {
  QetaArticleButtons: QetaArticleButtonsClassKey;
  QetaMarkdownContent: QetaMarkdownContentClassKey;
  QetaArticle: QetaArticleContentClassKey;
  QetaVoteButtons: QetaVoteButtonsClassKey;
  QetaStatsChart: QetaStatsChartClassKey;
  QetaMarkdownEditor: QetaMarkdownEditorClassKey;
  QetaCommentList: QetaCommentListClassKey;
  QetaCommentSection: QetaCommentSectionClassKey;
  QetaSearchBar: QetaSearchBarClassKeys;
  QetaQuestionCard: QuestionCardClassKeys;
  QetaAnswerCard: AnswerCardClassKeys;
};

export type QetaOverrides = Overrides & {
  [Name in keyof QetaComponentsNameToClassKey]?: Partial<
    StyleRules<QetaComponentsNameToClassKey[Name]>
  >;
};
