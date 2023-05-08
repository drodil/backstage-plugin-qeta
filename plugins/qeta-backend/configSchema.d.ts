export interface Config {
  qeta?: {
    /**
     * Allow anonymous questions
     *
     * @visibility backend
     */
    allowAnonymous?: boolean;
    /**
     * Configuration about images attachments storage
     *
     * @visibility backend
     */
    storage?: {
      type?: 'database' | 'filesystem';
      folder?: string;
      maxSizeImage?: number;
      allowedMimeTypes?: string[];
    };
  };
}
