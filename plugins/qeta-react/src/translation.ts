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
      post: 'post',
      experts: 'Experts',
      tagExpert: 'This user is an expert in this area',
      question: 'question',
      article: 'article',
      articles: 'articles',
      link: 'link',
      links: 'links',
      collection: 'collection',
      score: '{{score}} score',
      comments: 'Comments',
      answers: 'answers',
      questions: 'questions',
      votes: 'votes',
      clicks: 'clicks',
      views: 'views',
      postStats: 'Post stats',
      anonymousAuthor: 'Anonymous',
      search: 'Search',
      readMore: 'Read more',
      clear: 'Clear search',
      answersCount_zero: 'No answers',
      answersCount_one: '{{count}} answer',
      answersCount_other: '{{count}} answers',
      viewsCount_zero: 'Viewed {{count}} times',
      viewsCount_one: 'Viewed {{count}} time',
      viewsCount_other: 'Viewed {{count}} times',
      viewsShort_zero: '0 views',
      viewsShort_one: '{{count}} view',
      viewsShort_other: '{{count}} views',
      votesCount_zero: '0 votes',
      votesCount_one: '{{count}} vote',
      votesCount_other: '{{count}} votes',
      clicksCount_zero: '0 clicks',
      clicksCount_one: '{{count}} click',
      clicksCount_other: '{{count}} clicks',
      posts_zero: 'No {{itemType}}s',
      posts_one: '{{count}} {{itemType}}',
      posts_other: '{{count}} {{itemType}}s',
      collections_zero: 'No collections',
      collections_one: '{{count}} collection',
      collections_other: '{{count}} collections',
      entities_zero: 'No entities',
      entities_one: '{{count}} entity',
      entities_other: '{{count}} entities',
      followers_zero: 'No followers',
      followers_one: '{{count}} follower',
      followers_other: '{{count}} followers',
      postsLabel_one: '{{itemType}}',
      postsLabel_other: '{{itemType}}s',
      followersLabel_one: 'follower',
      followersLabel_other: 'followers',
      unsaved_changes:
        'You have unsaved changes. Are you sure you want to leave?',
      loading: 'Loading...',
      draft: 'Draft',
      deleted: 'Deleted',
    },
    markdownEditor: {
      write: 'Write',
      preview: 'Preview',
      uploadingImage: 'Uploading image...',
      pasteDropSelect: 'Paste, drop or select an image',
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
        label: 'Search answer',
        placeholder: 'Search...',
      },
    },
    anonymousCheckbox: {
      tooltip:
        "By enabling this, other users won't be able to see you as an author",
      answerAnonymously: 'Answer anonymously',
      postAnonymously: 'Post anonymously',
      info: 'Your name will not be shown to others.',
    },
    fileInput: {
      label: 'Header image',
      helperText: 'URL of the header image to be used',
      uploadHeaderImage: 'Upload image',
      preview: 'Preview image',
      dropHere: 'Drop your image here',
      dragAndDrop: 'Drag and drop an image here',
      supportedFormats: 'Supported formats: {{formats}}',
      selectFile: 'Select File',
      imageLoadError: 'Could not load image. Please check the URL.',
    },
    collectionForm: {
      errorPosting: 'Could not post collection',
      titleInput: {
        label: 'Title',
        helperText: 'Title of the collection',
        placeholder: 'e.g. Questions about Backstage',
      },
      descriptionInput: {
        label: 'Description',
        placeholder:
          'Describe your collection in detail. What topics does it cover?',
        markdownHelp: 'Markdown help',
      },
      submit: {
        existingCollection: 'Save',
        newCollection: 'Create Collection',
      },
      submitting: 'Creating...',
      tips_1:
        "Choose a clear and descriptive title that reflects the collection's purpose",
      tips_2:
        'Provide a detailed description of what topics or questions the collection will contain',
      tips_3:
        'Use markdown formatting to describe your collection with headings, lists, and links',
    },
    postForm: {
      errorPosting: 'Could not post {{type}}',
      errorLoading: 'Could not load {{type}}',
      uploadHeaderImage: 'Upload header image',
      titleInput: {
        label: 'Title',
        helperText:
          'Write a good title for your {{type}} that people can understand',
        placeholder: 'e.g. How do I deploy a Backstage plugin?',
        placeholder_link: 'e.g. Backstage documentation',
      },
      contentInput: {
        label: 'Your {{type}}',
        placeholder_question:
          'Describe your problem in detail. What have you tried? What did you expect to happen?',
        placeholder_article:
          'Write your article content here. Use headings, lists, and images to organize your information.',
        placeholder_link: 'Why is this link useful? Who will benefit from it?',
        markdownHelp: 'Markdown help',
      },
      urlInput: {
        label: 'URL',
        helperText: 'Paste the link you want to share',
        placeholder: 'https://',
        invalid: 'Please enter a valid URL (starting with http:// or https://)',
      },
      authorInput: {
        label: 'Author',
        placeholder: 'Select author',
      },
      submit: {
        existingPost: 'Save',
        publish: 'Publish',
      },
      successPosting: 'Your {{type}} was posted successfully!',
      submitting: 'Posting...',
      savingDraft: 'Saving draft...',
      saveDraft: 'Save as draft',
      updateDraft: 'Save draft',
      draftSaved: 'Draft saved',
      tips_question_1: 'Describe your problem in detail.',
      tips_question_2:
        'Include what you have tried and what you expected to happen.',
      tips_question_3:
        'Share error messages, logs, or screenshots if possible.',
      tips_question_4: 'Use code blocks for code or configuration.',
      tips_article_1: 'Write a clear and engaging introduction.',
      tips_article_2: 'Organize your content with headings and lists.',
      tips_article_3: 'Add images or diagrams to illustrate your points.',
      tips_article_4: 'Cite sources or link to relevant documentation.',
      tips_link_1: 'Explain why this link is useful.',
      tips_link_2: 'Describe who will benefit from this link.',
      autoSaveDraft: 'Auto-save',
      autoSaveDraftTooltip:
        'Automatically save your post every 3 seconds when changes are made',
      autoSaveSuccess: 'Saved automatically',
    },
    answerForm: {
      errorPosting: 'Could not post answer',
      contentInput: {
        placeholder: 'Your answer',
      },
      submitting: 'Submitting...',
      submit: {
        existingAnswer: 'Save',
        newAnswer: 'Post',
      },
    },
    entitiesInput: {
      label: 'Entities',
      placeholder: 'Type or select entities',
      helperText: 'Add up to {{max}} entities',
      minimumError: 'Please add at least {{min}} entities',
      suggestedEntities: 'Suggested entities',
    },
    tagsInput: {
      label: 'Tags',
      placeholder: 'Type or select tags',
      helperText: 'Add up to {{max}} tags',
      allowAddHelperText:
        'You can create new tags by typing the tag and pressing enter',
      minimumError: 'Please add at least {{min}} tags',
      suggestedTags: 'Suggested tags',
    },
    askPage: {
      title: {
        existingQuestion: 'Edit question',
        entityQuestion: 'Ask a question about {{entity}}',
        newQuestion: 'Ask a question',
      },
      templateSelection: 'Select a template for your question',
      questionForm: 'Ask a question',
      selectTemplate: 'Select a template for your question',
    },
    writePage: {
      title: {
        existingArticle: 'Edit article',
        entityArticle: 'Write an article about {{entity}}',
        newArticle: 'New article',
      },
    },
    createLinkPage: {
      title: {
        existingLink: 'Edit link',
        entityLink: 'Create a link about {{entity}}',
        newLink: 'New link',
      },
      editButton: 'Edit this link',
    },
    collectionCreatePage: {
      title: {
        existingCollection: 'Edit collection',
        newCollection: 'New collection',
      },
    },
    askQuestionButton: {
      title: 'Ask a question',
    },
    addToCollectionButton: {
      title: 'Collections',
      manage: 'Add or remove this post from collections',
      close: 'Close',
      removed: 'Removed from collection {{collection}}',
      added: 'Added to collection {{collection}}',
    },
    writeArticleButton: {
      title: 'Write an article',
    },
    createLinkButton: {
      title: 'Link',
    },
    createCollectionButton: {
      title: 'Create a collection',
    },
    commentList: {
      save: 'Save',
      editLink: 'edit',
      deleteLink: 'delete',
    },
    markdown: {
      toc: 'Table of contents',
    },
    commentSection: {
      input: {
        placeholder: 'Your comment',
      },
      addComment: 'Add a comment',
      leaveComment: 'Leave a comment',
      post: 'Post',
    },
    tagChip: {
      nonExistingTag: 'This tag does not yet exist',
    },
    editTagModal: {
      title: 'Edit tag {{tag}}',
      description: 'Tag description',
      errorPosting: 'Failed to edit',
      expertsLabel: 'Experts',
      expertsPlaceholder: 'Tag experts',
      saveButton: 'Save',
      cancelButton: 'Cancel',
    },
    createTagModal: {
      title: 'Create a new tag',
      tagInput: 'Tag',
      description: 'Tag description',
      errorPosting: 'Failed to create',
      createButton: 'Create',
      cancelButton: 'Cancel',
      invalidTagAlert:
        'Invalid tag given. Tags can only contain lowercase letters, numbers, hyphens, and underscores. Tag must be less than 255 characters.',
    },
    deleteModal: {
      title: {
        question: 'Are you sure you want to delete this post?',
        answer: 'Are you sure you want to delete this answer?',
        collection: 'Are you sure you want to delete this collection?',
        tag: 'Are you sure you want to delete this tag?',
      },
      errorDeleting: 'Failed to delete',
      reason: 'Reason for deletion',
      deleteButton: 'Delete',
      cancelButton: 'Cancel',
      tagDeleted: 'Tag deleted',
      collectionDeleted: 'Collection deleted',
      questionDeleted: 'Question deleted',
      articleDeleted: 'Article deleted',
      answerDeleted: 'Answer deleted',
      linkDeleted: 'Link deleted',
    },
    favoritePage: {
      title: 'Favorited posts',
    },
    leftMenu: {
      buttonLabel: 'Menu',
      home: 'Home',
      questions: 'Questions',
      articles: 'Articles',
      links: 'Links',
      profile: 'Profile',
      tags: 'Tags',
      entities: 'Entities',
      favoriteQuestions: 'Favorites',
      statistics: 'Statistics',
      collections: 'Collections',
      content: 'Content',
      community: 'Community',
      users: 'Users',
      manage: 'Manage',
      moderate: 'Moderate',
      expand: 'Expand menu',
      collapse: 'Collapse menu',
    },
    moderatorPage: {
      title: 'Moderate',
      tools: 'Tools',
      templates: 'Templates',
      templatesInfo:
        'Templates can be used to prefill question content for the user',
      deletedPosts: 'Deleted posts',
    },
    suggestionsCard: {
      title: 'Suggestions',
      noSuggestions: 'No suggestions',
      noCorrectAnswer:
        'Your question "{{title}}" does not have a correct answer',
      newQuestion: 'Do you have an answer for "{{title}}"?',
      newArticle: 'You might like to read "{{title}}"',
      newLink: 'You might like to check this link "{{title}}"',
      draftPost: 'Ready to finalize draft post "{{title}}"?',
      randomPost: 'Share your thoughts on "{{title}}"?',
    },
    homePage: {
      title: 'Home',
    },
    impactCard: {
      title: 'Your impact',
      views: 'views',
      error: 'Failed to load impact data',
      contributions: 'Your contributions helped {{lastWeek}} people this week',
    },
    rightMenu: {
      followedEntities: 'Followed entities',
      followedTags: 'Followed tags',
      followedCollections: 'Followed collections',
      followedUsers: 'Followed users',
      expand: 'Expand sidebar',
      collapse: 'Collapse sidebar',
    },
    highlights: {
      loadError: 'Failed to load questions',
      own: {
        title: 'Your latest questions',
        noQuestionsLabel: 'No questions',
      },
      hotQuestions: {
        title: 'Hot questions',
        noQuestionsLabel: 'No questions',
      },
      hotArticles: {
        title: 'Hot articles',
        noArticlesLabel: 'No articles',
      },
      hotLinks: {
        title: 'Hot links',
        noLinksLabel: 'No links',
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
    questionsPage: {
      title: 'All questions',
    },
    articlesPage: {
      title: 'All articles',
    },
    linksPage: {
      title: 'All links',
    },
    userLink: {
      anonymous: 'Anonymous',
      you: 'You',
    },
    articlePage: {
      notFound: 'Could not find the article',
      errorLoading: 'Could not load article',
      editButton: 'Edit this article',
      restoreButton: 'Restore this article',
      deleteButton: 'Delete this article',
    },
    linkPage: {
      notFound: 'Could not find the link',
      errorLoading: 'Could not load link',
      editButton: 'Edit this link',
      restoreButton: 'Restore this link',
      deleteButton: 'Delete this link',
    },
    templateList: {
      errorLoading: 'Could not load templates',
      editButton: 'Edit',
      deleteButton: 'Delete',
      createButton: 'Create',
      errorPosting: 'Could not post template',
      noTemplates: 'No templates',
      noTemplatesDescription: 'Create a new template to get started',
      titleInput: {
        label: 'Title',
        helperText: 'Name of the template',
      },
      descriptionInput: {
        label: 'Description',
        helperText: 'Template description, what is it used for?',
      },
      questionTitleInput: {
        label: 'Default question title',
        helperText:
          'Question title to be used when creating a question with this template',
      },
      questionContentInput: {
        placeholder:
          'Question content to be used when creating a question with this template',
      },
      submit: {
        existingTemplate: 'Save',
        newTemplate: 'Create',
      },
    },
    templateSelectList: {
      selectButton: 'Choose',
      title: 'Create a question from template',
      genericQuestion: 'Generic question',
      genericQuestionDescription: 'Create a generic question',
    },
    pagination: {
      defaultTooltip: 'Number of items',
    },
    collectionsPage: {
      title: 'Collections',
      search: {
        label: 'Search collection',
        placeholder: 'Search...',
      },
    },
    collectionPage: {
      description: 'Description',
      info: 'You can add questions and articles to the collection from question and article pages',
    },
    searchResult: {
      created: 'Created',
    },
    questionPage: {
      errorLoading: 'Could not load question',
      editButton: 'Edit',
      restoreButton: 'Restore',
      notFound: 'Could not find the question',
      draftStatus:
        'This is a draft post. Please edit and publish it to make it visible to others.',
      deletedStatus:
        'This post has been deleted. You can delete it permanently or restore it.',
      sortAnswers: {
        label: 'Sort answers',
        menuLabel: 'Sort answers menu',
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
      postedAtTime: 'Posted',
      updatedAtTime: 'Updated',
      updatedBy: 'by',
      answeredAtTime: 'Answered',
    },
    favorite: {
      remove: 'Remove this post from favorites',
      add: 'Mark this post as favorite',
    },
    link: {
      post: 'Copy link to this post to clipboard',
      answer: 'Copy link to this answer to clipboard',
      aria: 'Copy link to clipboard',
      copied: 'Link copied to clipboard',
      open: 'Open link in new tab',
    },
    code: {
      aria: 'Copy code to clipboard',
      copied: 'Code copied to clipboard',
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
      post: {
        good: 'This {{type}} is good',
        bad: 'This {{type}} is not good',
        own: 'You cannot vote your own {{type}}',
      },
    },
    datePicker: {
      from: 'From date',
      to: 'To date',
      invalidRange:
        "Date range invalid, 'To date' should be greater than 'From date'",
      range: {
        label: 'Posted',
        default: 'Select',
        last7days: 'Last 7 days',
        last30days: 'Last 30 days',
        custom: 'Custom',
      },
    },
    ranking: {
      top: 'Rank this question to the top in this collection',
      bottom: 'Rank this question to the bottom in this collection',
      up: 'Rank this question up in this collection',
      down: 'Rank this question down in this collection',
    },
    filterPanel: {
      filterButton: 'Filter',
      noAnswers: {
        label: 'No answers',
      },
      drafts: {
        label: 'My drafts',
      },
      noCorrectAnswers: {
        label: 'No correct answers',
      },
      noVotes: {
        label: 'No votes',
      },
      quickFilters: {
        label: 'Quick filters',
      },
      starredEntities: {
        label: 'Starred entities',
      },
      ownedEntities: {
        label: 'Owned entities',
      },
      entitiesRelation: {
        label: 'Entities relation',
      },
      toggleEntityRelation: {
        and: 'Change to only with all selected entities (AND)',
        or: 'Change to with any selected entities (OR)',
      },
      toggleTagRelation: {
        and: 'Change to only with all selected tags (AND)',
        or: 'Change to with any selected tags (OR)',
      },
      orderBy: {
        rank: 'Rank',
        label: 'Order by',
        title: 'Title',
        created: 'Created',
        views: 'Views',
        score: 'Score',
        clicks: 'Clicks',
        trend: 'Trend',
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
    postsList: {
      errorLoading: 'Could not load {{itemType}}s',
      postsPerPage: '{{itemType}}s per page',
    },
    postsContainer: {
      title: {
        by: `{{itemType}}s by`,
        about: '{{itemType}}s about',
        tagged: `{{itemType}} tagged with {{tags}}`,
        favorite: 'Your favorite {{itemType}}s',
      },
      search: {
        label: 'Search {{itemType}}',
        placeholder: 'Search...',
      },
      noItems: 'No {{itemType}}s',
      createButton: 'Go ahead and create one!',
    },
    postsTable: {
      errorLoading: 'Could not load questions',
      latest: 'Latest',
      mostViewed: 'Most viewed',
      favorites: 'Favorites',
      cells: {
        title: 'Title',
        type: 'Type',
        author: 'Author',
        asked: 'Asked',
        updated: 'Last updated',
      },
    },
    statistics: {
      errorLoading: 'Could not load statistics',
      notAvailable: 'Statistics are unavailable',
      ranking: 'User ranking 🏆',
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
      defaultTitle: 'Tags',
      createTag: 'Create tag',
      search: {
        label: 'Search tag',
        placeholder: 'Search...',
      },
      tags_zero: 'No tags',
      tags_one: '{{count}} tag',
      tags_other: '{{count}} tags',
    },
    entitiesPage: {
      errorLoading: 'Could not load entities',
      defaultTitle: 'Entities',
      search: {
        label: 'Search entity',
        placeholder: 'Search...',
      },
      entities_zero: 'No entities',
      entities_one: '{{count}} entity',
      entities_other: '{{count}} entities',
    },
    aiAnswerCard: {
      regenerate: 'Regenerate this answer',
      answer: 'Answer from {{name}}',
      summary: 'Summary by {{name}}',
      show: 'Show',
      hide: 'Hide',
      loading: 'Thinking...',
    },
    usersPage: {
      title: 'Users',
      errorLoading: 'Could not load users',
      defaultTitle: 'users',
      search: {
        label: 'Search user',
        placeholder: 'Search...',
      },
      users_zero: 'No users',
      users_one: '{{count}} user',
      users_other: '{{count}} users',
    },
    userPage: {
      profileTab: 'Profile',
      statistics: 'Statistics',
      questions: 'Questions',
      answers: 'Answers',
      collections: 'Collections',
      articles: 'Articles',
      links: 'Links',
      followUser: 'Follow {{name}}',
      profilePicture: 'Profile picture of {{name}}',
      profileHeader: 'User profile',
    },
    stats: {
      noStats: 'No statistics available. Check back later!',
      questions: 'Questions',
      answers: 'Answers',
      comments: 'Comments',
      votes: 'Votes',
      views: 'Views',
      articles: 'Articles',
      links: 'Links',
      followers: 'Followers',
      users: 'Users',
      tags: 'Tags',
      barChart: 'Bar Chart',
      lineChart: 'Line Chart',
      chartType: 'Chart Type',
      tooltip: 'Chart Tooltip',
      dateAxis: 'Date Axis',
      valueAxis: 'Value Axis',
      totalViews: 'Total views',
      totalQuestions: 'Total questions',
      totalAnswers: 'Total answers',
      totalComments: 'Total comments',
      totalVotes: 'Total votes',
      totalUsers: 'Total users',
      totalTags: 'Total tags',
      totalArticles: 'Total articles',
      totalLinks: 'Total links',
      totalFollowers: 'Total followers',
    },
    collectionButton: {
      follow: 'Follow',
      unfollow: 'Unfollow',
      tooltip:
        'By following a collection, you will get notified when ever a new post is added to the collection',
    },
    tagButton: {
      follow: 'Follow',
      unfollow: 'Unfollow',
      edit: 'Edit',
      delete: 'Delete',
      tooltip:
        'By following a tag, you will get notified when ever a new post with that tag is posted',
    },
    entityButton: {
      follow: 'Follow',
      unfollow: 'Unfollow',
      tooltip:
        'By following an entity, you will get notified when ever a new post for that entity is posted',
    },
    userButton: {
      follow: 'Follow',
      unfollow: 'Unfollow',
      tooltip:
        'By following a user, you will get notified when ever a new post by that user is posted',
    },
    viewToggle: {
      listView: 'List View',
      gridView: 'Grid View',
    },
  },
});

export const qetaTranslations = createTranslationResource({
  ref: qetaTranslationRef,
  translations: {},
});
