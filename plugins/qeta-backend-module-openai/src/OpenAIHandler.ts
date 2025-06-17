/*
 * SPDX-FileCopyrightText: Copyright 2024 OP Financial Group (https://op.fi). All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-OpAllRightsReserved
 */
import { AIHandler } from '@drodil/backstage-plugin-qeta-node';
import {
  BackstageCredentials,
  BackstageUserPrincipal,
  LoggerService,
} from '@backstage/backend-plugin-api';
import {
  AIResponse,
  Article,
  Question,
} from '@drodil/backstage-plugin-qeta-common';
import { Config } from '@backstage/config';
import { OpenAI } from 'openai';

export class OpenAIHandler implements AIHandler {
  private readonly model: string;
  private readonly maxTokens?: number;
  private readonly temperature?: number;
  private readonly systemPrompt?: string;
  private readonly userPromptPrefix?: string;
  private readonly userPromptSuffix?: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly config: Config,
  ) {
    this.model =
      this.config.getOptionalString('qeta.openai.model') ?? 'gpt-3.5-turbo';
    this.maxTokens = this.config.getOptionalNumber('qeta.openai.maxTokens');
    this.temperature = this.config.getOptionalNumber('qeta.openai.temperature');
    this.systemPrompt = this.config.getOptionalString(
      'qeta.openai.prompts.system',
    );
    this.userPromptPrefix = this.config.getOptionalString(
      'qeta.openai.prompts.userPrefix',
    );
    this.userPromptSuffix = this.config.getOptionalString(
      'qeta.openai.prompts.userSuffix',
    );
  }

  async answerExistingQuestion(
    question: Question,
    options?: {
      credentials?: BackstageCredentials<BackstageUserPrincipal>;
    },
  ): Promise<AIResponse> {
    const enabled = this.config.getOptionalBoolean(
      'qeta.openai.answer.existingQuestions',
    );
    if (enabled === false) {
      throw new Error('OpenAI is disabled for existing questions');
    }

    this.logger.info(`Answering question ${question.id} using OpenAI`);

    const prompt = `${question.title}\n${question.content}`;
    const completion = await this.getCompletion(
      prompt,
      options?.credentials?.principal.userEntityRef,
    );

    return { answer: completion };
  }

  async answerNewQuestion(
    title: string,
    content: string,
    options?: { credentials?: BackstageCredentials<BackstageUserPrincipal> },
  ): Promise<AIResponse> {
    const enabled = this.config.getOptionalBoolean(
      'qeta.openai.answer.newQuestions',
    );
    if (enabled === false) {
      throw new Error('OpenAI is disabled for new questions');
    }

    this.logger.info(`Answering question ${title} using OpenAI`);

    const prompt = `${title}\n${content}`;
    const completion = await this.getCompletion(
      prompt,
      options?.credentials?.principal.userEntityRef,
    );
    return { answer: completion };
  }

  async summarizeArticle(
    article: Article,
    options?: { credentials?: BackstageCredentials<BackstageUserPrincipal> },
  ): Promise<AIResponse> {
    const enabled = this.config.getOptionalBoolean(
      'qeta.openai.answer.articleSummary',
    );
    if (enabled === false) {
      throw new Error('OpenAI is disabled for article summaries');
    }

    this.logger.info(`Summarizing article ${article.id} using OpenAI`);
    const prompt = `Can you summarize this article?\nTitle: ${article.title}\nContent: ${article.content}`;
    const completion = await this.getCompletion(
      prompt,
      options?.credentials?.principal.userEntityRef,
    );

    return { answer: completion };
  }

  async suggestTags(
    title: string,
    content: string,
    options?: { credentials?: BackstageCredentials<BackstageUserPrincipal> },
  ): Promise<{ tags: string[] }> {
    const enabled = this.config.getOptionalBoolean(
      'qeta.openai.post.tagSuggestions',
    );
    if (enabled === false) {
      throw new Error('OpenAI is disabled for tag suggestions');
    }

    this.logger.info(`Suggesting tags for post "${title}" using OpenAI`);
    const prompt = `Based on the following post title and content, suggest relevant tags. Always place the most relevant tags first. Tags should be single words, no spaces. Return only a comma-separated list of tags, nothing else.\nTitle: ${title}\nContent: ${content}`;
    const completion = await this.getCompletion(
      prompt,
      options?.credentials?.principal.userEntityRef,
    );

    const tags = completion
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    return { tags };
  }

  private async getCompletion(prompt: string, user?: string) {
    const client = this.getClient();

    let completion;
    try {
      const messages: Array<OpenAI.ChatCompletionMessageParam> =
        new Array<OpenAI.ChatCompletionMessageParam>();
      if (this.systemPrompt) {
        messages.push({ role: 'system', content: this.systemPrompt });
      }
      const userPrompt: OpenAI.ChatCompletionMessageParam = {
        role: 'user',
        content: `${this.userPromptPrefix ?? ''}${prompt}${
          this.userPromptSuffix ?? ''
        }`,
      };
      messages.push(userPrompt);

      completion = await client.chat.completions.create({
        model: this.model,
        messages: messages,
        stream: false,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        user,
        n: 1,
      });
    } catch (e) {
      // Hide the real error from users
      this.logger.error(`Error from OpenAI: ${e}`);
      throw new Error('Failed to get response from OpenAI');
    }

    if (
      completion.choices.length === 0 ||
      !completion.choices[0].message.content
    ) {
      throw new Error('No response from OpenAI');
    }
    return completion.choices[0].message.content;
  }

  private getClient() {
    const apiKey = this.config.getOptionalString('qeta.openai.apiKey');
    const organization = this.config.getOptionalString(
      'qeta.openai.organization',
    );
    const endpoint = this.config.getOptionalString('qeta.openai.endpoint');
    const project = this.config.getOptionalString('qeta.openai.project');

    return new OpenAI({ baseURL: endpoint, apiKey, organization, project });
  }
}
