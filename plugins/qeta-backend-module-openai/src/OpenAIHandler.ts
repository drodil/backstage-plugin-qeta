/*
 * SPDX-FileCopyrightText: Copyright 2024 OP Financial Group (https://op.fi). All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-OpAllRightsReserved
 */
import { AIHandler } from '@drodil/backstage-plugin-qeta-node';
import {
  BackstageCredentials,
  BackstageUserPrincipal,
  CacheService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { AIResponse, Question } from '@drodil/backstage-plugin-qeta-common';
import { Config } from '@backstage/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';

export class OpenAIHandler implements AIHandler {
  private readonly model: string;
  private readonly maxTokens: number | undefined;
  private readonly temperature: number | undefined;
  private readonly systemPrompt: string | undefined;
  private readonly userPromptPrefix: string | undefined;
  private readonly userPromptSuffix: string | undefined;

  constructor(
    private readonly logger: LoggerService,
    private readonly config: Config,
    private readonly cache?: CacheService,
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
    const cached = await this.cache?.get<string>(
      `openai:question_${question.id}`,
    );
    if (cached) {
      return JSON.parse(cached);
    }

    this.logger.info(`Answering question ${question.id} using OpenAI`);

    const prompt = `${question.title}\n${question.content}`;
    const completion = await this.getCompletion(
      prompt,
      options?.credentials?.principal.userEntityRef,
    );

    const ret = { answer: completion };
    await this.cache?.set(
      `openai:question_${question.id}`,
      JSON.stringify(ret),
      {
        ttl: { minutes: 10 },
      },
    );
    return ret;
  }

  async answerNewQuestion(
    title: string,
    content: string,
    options?: { credentials?: BackstageCredentials<BackstageUserPrincipal> },
  ): Promise<AIResponse> {
    this.logger.info(`Answering question ${title} using OpenAI`);

    const prompt = `${title}\n${content}`;
    const completion = await this.getCompletion(
      prompt,
      options?.credentials?.principal.userEntityRef,
    );
    return { answer: completion };
  }

  private async getCompletion(prompt: string, user?: string) {
    const client = this.getClient();

    let completion;
    try {
      const messages: Array<ChatCompletionMessageParam> =
        new Array<ChatCompletionMessageParam>();
      if (this.systemPrompt) {
        messages.push({ role: 'system', content: this.systemPrompt });
      }
      const userPrompt: ChatCompletionMessageParam = {
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
