import {
  createTranslationRef,
  createTranslationResource,
} from '@backstage/core-plugin-api/alpha';

/** @alpha */
export const qetaTranslationRef = createTranslationRef({
  id: 'qeta',
  messages: {
    pluginName: 'Q&A',
    answerList: {
      errorLoading: 'Could not load answers',
      noAnswers: 'No answers',
      limitSelect: 'Answers per page',
    },
    common: {
      score: '{{score}} score',
      anonymousAuthor: 'Anonymous',
      answers_zero: 'No answers',
      answers_one: '{{count}} answer',
      answers_other: '{{count}} answers',
      views_zero: 'Viewed {{count}} times',
      views_one: 'Viewed {{count}} time',
      views_other: 'Viewed {{count}} times',
      viewsShort_zero: '0 views',
      viewsShort_one: '{{count}} view',
      viewsShort_other: '{{count}} views',
      questions_zero: 'No questions',
      questions_one: '{{count}} question',
      questions_other: '{{count}} questions',
    },
    answer: {
      questionTitle: 'Q: {{question}}',
      answeredTime: 'answered',
    },
    answerContainer: {
      title: {
        answersBy: 'Answers by',
        answersAbout: 'Answers about',
        answersTagged: `Answers tagged with {{tags}}`,
      },
      search: {
        label: 'Search for answers',
        placeholder: 'Search...',
      },
    },
    anonymousCheckbox: {
      tooltip:
        "By enabling this, other users won't be able to see you as an author",
      answerAnonymously: 'Answer anonymously',
      askAnonymously: 'Ask anonymously',
    },
    askForm: {
      errorPosting: 'Could not post question',
      titleInput: {
        label: 'Title',
        helperText:
          'Write good title for your question that people can understand',
      },
      contentInput: {
        placeholder: 'Your question',
      },
      submit: {
        existingQuestion: 'Save',
        newQuestion: 'Post',
      },
    },
    answerForm: {
      errorPosting: 'Could not post answer',
      contentInput: {
        placeholder: 'Your answer',
      },
      submit: {
        existingAnswer: 'Save',
        newAnswer: 'Post',
      },
    },
    entitiesInput: {
      label: 'Entities',
      placeholder: 'Type or select entities',
      helperText: 'Add up to {{max}} entities this question relates to',
    },
    tagsInput: {
      label: 'Tags',
      placeholder: 'Type or select tags',
      helperText: 'Add up to {{max}} tags to categorize your question',
    },
    askPage: {
      title: {
        existingQuestion: 'Edit question',
        entityQuestion: 'Ask a question about {{entity}}',
        newQuestion: 'Ask question',
      },
    },
    askQuestionButton: {
      title: 'Ask question',
    },
    backToQuestionsButton: {
      title: 'Back to questions',
    },
    commentList: {
      deleteLink: 'delete',
    },
    commentSection: {
      input: {
        placeholder: 'Your comment',
      },
      addComment: 'Add comment',
      post: 'Post',
    },
    deleteModal: {
      title: {
        question: 'Are you sure you want to delete this question?',
        answer: 'Are you sure you want to delete this answer?',
      },
      errorDeleting: 'Failed to delete',
      deleteButton: 'Delete',
      cancelButton: 'Cancel',
    },
    favoritePage: {
      title: 'Your favorite questions',
    },
    homePage: {
      moreMenu: {
        title: 'More',
        profile: 'Profile',
        tags: 'Tags',
        favoriteQuestions: 'Favorite questions',
        statistics: 'Statistics',
      },
      title: 'All questions',
      followedTags: 'Followed tags',
      highlights: {
        loadError: 'Failed to load questions',
        hot: {
          title: 'Hot questions',
          noQuestionsLabel: 'No questions',
        },
        unanswered: {
          title: 'Unanswered questions',
          noQuestionsLabel: 'No unanswered questions',
        },
        incorrect: {
          title: 'Questions without correct answer',
          noQuestionsLabel: 'No questions without correct answers',
        },
      },
    },
    userLink: {
      anonymous: 'Anonymous',
    },
    questionPage: {
      errorLoading: 'Could not load question',
      editButton: 'Edit',
      sortAnswers: {
        label: 'Sort answers',
        default: 'Default',
        createdDesc: 'Created (desc)',
        createdAsc: 'Created (asc)',
        scoreDesc: 'Score (desc)',
        scoreAsc: 'Score (asc)',
        commentsDesc: 'Comments (desc)',
        commentsAsc: 'Comments (asc)',
        authorDesc: 'Author (desc)',
        authorAsc: 'Author (asc)',
        updatedDesc: 'Updated (desc)',
        updatedAsc: 'Updated (asc)',
      },
    },
    authorBox: {
      askedAtTime: 'asked',
      postedAtTime: 'Posted',
      updatedAtTime: 'Updated',
      updatedBy: 'by',
    },
    favorite: {
      remove: 'Remove this question from favorites',
      add: 'Mark this question as favorite',
    },
    link: {
      question: 'Copy link to this question to clipboard',
      answer: 'Copy link to this answer to clipboard',
      aria: 'Copy link to clipboard',
    },
    voteButtons: {
      answer: {
        markCorrect: 'Mark this answer correct',
        markIncorrect: 'Mark this answer incorrect',
        marked: 'This answer has been marked as correct',
        good: 'This answer is good',
        bad: 'This answer is not good',
        own: 'You cannot vote your own answer',
      },
      question: {
        good: 'This question is good',
        bad: 'This question is not good',
        own: 'You cannot vote your own question',
      },
    },
    datePicker: {
      from: 'From date',
      to: 'To date',
      invalidRange:
        "Date range invalid, 'To date' should be greater than 'From date'",
      range: {
        label: 'Date range',
        default: 'Select',
        last7days: 'Last 7 days',
        last30days: 'Last 30 days',
        custom: 'Custom',
      },
    },
    filterPanel: {
      filterButton: 'Filter',
      noAnswers: {
        label: 'No answers',
      },
      noCorrectAnswers: {
        label: 'No correct answers',
      },
      noVotes: {
        label: 'No votes',
      },
      orderBy: {
        label: 'Order by',
        created: 'Created',
        views: 'Views',
        score: 'Score',
        answers: 'Answers',
        updated: 'Updated',
      },
      order: {
        label: 'Order',
        asc: 'Ascending',
        desc: 'Descending',
      },
      filters: {
        label: 'Filters',
        entity: {
          label: 'Entity',
          placeholder: 'Type or select entity',
        },
        tag: {
          label: 'Tag',
          placeholder: 'Type or select tag',
        },
      },
    },
    questionList: {
      errorLoading: 'Could not load questions',
      questionsPerPage: 'Questions per page',
    },
    questionsContainer: {
      title: {
        questionsBy: 'Questions by',
        questionsAbout: 'Questions about',
        questionsTagged: `Questions tagged with {{tags}}`,
        favorite: 'Your favorite questions',
      },
      search: {
        label: 'Search for questions',
        placeholder: 'Search...',
      },
      noQuestions: 'No questions found',
      askOneButton: 'Go ahead and ask one!',
    },
    questionsTable: {
      errorLoading: 'Could not load questions',
      latest: 'Latest',
      mostViewed: 'Most viewed',
      favorites: 'Favorites',
      cells: {
        title: 'Title',
        author: 'Author',
        asked: 'Asked',
        updated: 'Last updated',
      },
    },
    statistics: {
      errorLoading: 'Could not load statistics',
      notAvailable: 'Statistics are unavailable',
      ranking: 'Ranking Q&A 🏆',
      mostQuestions: {
        title: 'Most questions',
        description: 'People who have posted most questions',
      },
      mostAnswers: {
        title: 'Most answers',
        description: 'People who have posted most answers',
      },
      topVotedQuestions: {
        title: 'Top voted questions',
        description: 'People who have the highest rated questions',
      },
      topVotedAnswers: {
        title: 'Top voted answers',
        description: 'People who have the highest rated answers',
      },
      topVotedCorrectAnswers: {
        title: 'Top voted correct answers',
        description: 'People who have the highest rated correct answers',
      },
    },
    tagPage: {
      errorLoading: 'Could not load tags',
      taggedWithTitle: 'Questions tagged with {{tag}}',
      defaultTitle: 'Tags',
      search: {
        label: 'Search tag',
        placeholder: 'Search...',
      },
      tags_zero: 'No tags',
      tags_one: 'Showing {{count}} tag',
      tags_other: 'Showing {{count}} tags',
    },
    userPage: {
      profileTab: 'Profile',
      questions: 'Questions',
      answers: 'Answers',
    },
    tagButton: {
      follow: 'Follow',
      unfollow: 'Unfollow',
      tooltip:
        'By following a tag, you will get notified when ever a new question with that tag is posted',
    },
    entityButton: {
      follow: 'Follow',
      unfollow: 'Unfollow',
      tooltip:
        'By following an entity, you will get notified when ever a new question for that entity is posted',
    },
  },
});

export const qetaTranslations = createTranslationResource({
  ref: qetaTranslationRef,
  translations: {
    fi: () => import('./locale/fi'),
  },
});
