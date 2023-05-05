export interface Config {
  qeta?: {
    /**
     * Allow anonymous questions
     *
     * @visibility backend
     */
    allowAnonymous: boolean;
    /**
     * Configuration about images attachments storage
     *
     * @visibility backend
     */
    storage: {
      type?: string;
      folder?: string;
      maxSizeImage?: number;
      allowedFilesTypes?: string[];
    };
  };
}
