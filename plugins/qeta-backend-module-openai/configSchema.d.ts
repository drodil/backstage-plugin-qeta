/*
 * SPDX-FileCopyrightText: Copyright 2023 - 2024 OP Financial Group (https://op.fi). All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-OpAllRightsReserved
 */
export interface Config {
  qeta?: {
    openai?: {
      answer?: {
        /**
         * Whether to enable OpenAI for existing questions. Defaults to true.
         * Setting this false will disable AI answers in the question page.
         */
        existingQuestions?: boolean;
        /**
         * Whether to enable OpenAI for new questions. Defaults to true.
         * Setting this false will disable AI answers in the Ask a question form.
         */
        newQuestions?: boolean;
      };
      /**
       * The endpoint for accessing OpenAI services. Defaults to process.env.OPENAI_BASE_URL or
       * https://api.openai.com/v1.
       */
      endpoint?: string;
      /**
       * The API key for accessing OpenAI services. Defaults to process.env.OPENAI_API_KEY.
       *
       * @visibility secret
       */
      apiKey?: string;
      /**
       * Organization ID for accessing OpenAI services. Defaults to process.env.OPENAI_ORG_ID.
       *
       * @visibility secret
       */
      organization?: string;
      /**
       * The model to use for generating responses. Defaults to gpt-3.5-turbo.
       */
      model?: string;
      /**
       * Project ID for accessing OpenAI services. Defaults to process.env.OPENAI_PROJECT_ID.
       */
      project?: string;
      /**
       * The temperature to use for generating responses.
       */
      temperature?: number;
      /**
       * The maximum number of tokens to generate in the response.
       */
      maxTokens?: number;
      /**
       * Additional prompts to send to OpenAI.
       */
      prompts?: {
        /**
         * System prompt to send to OpenAI.
         */
        system?: string;
        /**
         * User prompt prefix.
         */
        userPrefix?: string;
        /**
         * User prompt suffix.
         */
        userSuffix?: string;
      };
    };
  };
}
