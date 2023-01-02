export interface Config {
  qeta?: {
    /**
     * Determine what kind of entities can be attached to questions.
     * For example [Component, API, Location, Template]. Default is [Component].
     *
     * @visibility frontend
     */
    entityKinds?: string[];
  };
}
