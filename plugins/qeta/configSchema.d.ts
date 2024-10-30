export interface Config {
  qeta?: {
    /**
     * Allow anonymous questions
     *
     * @visibility frontend
     */
    allowAnonymous?: boolean;
    /**
     * Determine what kind of entities can be attached to questions.
     * For example [System, Component, API, Location, Template]. Default is [Component, System].
     *
     * @visibility frontend
     * @deprecated use `entities` config instead
     */
    entityKinds?: string[];
    /**
     * Entities configuration for questions.
     *
     * @visibility frontend
     */
    entities?: {
      /**
       * Determine what kind of entities can be attached to questions.
       * For example [System, Component, API, Location, Template]. Default is [Component, System].
       *
       * @visibility frontend
       */
      kinds?: string[];
      /**
       * Maximum entities to attach to questions.
       *
       * @visibility frontend
       */
      max?: number;
    };
    /**
     * Question tags specific configuration
     *
     * @visibility frontend
     */
    tags?: {
      /**
       * Allow creation of new tags. Default: true
       *
       * @visibility frontend
       */
      allowCreation?: boolean;
      /**
       * Allowed tags to be used with questions.
       * Only valid if allowCreation is false.
       *
       * @visibility frontend
       */
      allowedTags?: string[];
      /**
       * Maximum number of tags per question. Default: 5
       *
       * @visibility frontend
       */
      max?: number;
    };
    /**
     * List of users/groups that can moderate questions and answers in case permission framework is not in use.
     * In case permission framework is in use, this list is used to determine if user
     * can access the moderator panel
     *
     * @visibility frontend
     */
    moderators?: string[];
    /**
     * If desire to disable image upload.
     * @visibility frontend
     */
    storage?: {
      /**
       * If desire to disable image upload.
       * @visibility frontend
       */
      disabled?: boolean;
    };
    /**
     * Name of the AI bot that responds to users questions. Defaults to 'AI'
     * @visibility frontend
     */
    aiBotName?: string;
  };
}
