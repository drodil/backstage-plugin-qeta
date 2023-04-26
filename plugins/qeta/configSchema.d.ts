export interface Config {
  qeta?: {
    /**
     * Determine what kind of entities can be attached to questions.
     * For example [System, Component, API, Location, Template]. Default is [Component, System].
     *
     * @visibility frontend
     */
    entityKinds?: string[];
    /**
     * If desire to disable image upload.
     * @visibility frontend
     */
    storage: {
      /**
       * If desire to disable image upload.
       * @visibility frontend
       */
      disabled?: boolean;
      /**
       * Sets the maximum allowed size of upload files in bytes. Default: 2500000
       * @visibility frontend
       */
      maxSizeImage?: number;
    };
  };
}
