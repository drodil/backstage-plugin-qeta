import { Page, expect, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';

export async function loginAsGuest(page: Page) {
  const enterButton = page.getByRole('button', { name: 'Enter' });

  try {
    await enterButton.waitFor({ state: 'visible', timeout: 5000 });
    await enterButton.click();
    await expect(enterButton).not.toBeVisible();
  } catch (e) {}
}

const AUTH_HEADER = 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l';

interface PostOptions {
  user?: string;
  title?: string;
  content?: string;
  tags?: string[];
  entities?: string[];
}

interface LinkOptions extends PostOptions {
  url?: string;
}

export const createQuestion = async (
  request: APIRequestContext,
  options?: PostOptions,
) => {
  const {
    user = 'user:default/guest',
    title = faker.lorem.sentence(),
    content = faker.lorem.paragraph(),
    tags = [faker.word.adjective(), faker.word.adjective()],
    entities = [],
  } = options || {};

  const question = {
    title,
    content,
    tags,
    user,
    entities,
    type: 'question',
  };

  const response = await request.post('http://localhost:7007/api/qeta/posts', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_HEADER,
      'x-user-id': user,
    },
    data: question,
  });

  return await response.json();
};

export const createArticle = async (
  request: APIRequestContext,
  options?: PostOptions,
) => {
  const {
    user = 'user:default/guest',
    title = faker.lorem.sentence(),
    content = faker.lorem.paragraphs(3),
    tags = [faker.word.adjective(), faker.word.adjective()],
    entities = [],
  } = options || {};

  const article = {
    title,
    content,
    tags,
    user,
    entities,
    type: 'article',
  };

  const response = await request.post('http://localhost:7007/api/qeta/posts', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_HEADER,
      'x-user-id': user,
    },
    data: article,
  });

  return await response.json();
};

export const createLink = async (
  request: APIRequestContext,
  options?: LinkOptions,
) => {
  const {
    user = 'user:default/guest',
    title = faker.lorem.sentence(),
    content = faker.lorem.paragraph(),
    url = faker.internet.url(),
    tags = [faker.word.adjective(), faker.word.adjective()],
    entities = [],
  } = options || {};

  const link = {
    title,
    content,
    url,
    type: 'link',
    tags,
    user,
    entities,
  };

  const response = await request.post('http://localhost:7007/api/qeta/posts', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_HEADER,
      'x-user-id': user,
    },
    data: link,
  });

  return await response.json();
};

export const createAnswer = async (
  request: APIRequestContext,
  questionId: number | string,
  options?: { content?: string; user?: string },
) => {
  const { user = 'user:default/guest', content = faker.lorem.paragraph() } =
    options || {};

  const answer = {
    answer: content,
    user,
  };

  const response = await request.post(
    `http://localhost:7007/api/qeta/posts/${questionId}/answers`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: AUTH_HEADER,
        'x-user-id': user,
      },
      data: answer,
    },
  );

  return await response.json();
};

export const createCollection = async (
  request: APIRequestContext,
  options?: { title?: string; description?: string; user?: string },
) => {
  const {
    user = 'user:default/guest',
    title = faker.lorem.sentence(),
    description = faker.lorem.sentence(),
  } = options || {};

  const collection = {
    title,
    description,
    user,
  };

  const response = await request.post(
    'http://localhost:7007/api/qeta/collections',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: AUTH_HEADER,
        'x-user-id': user,
      },
      data: collection,
    },
  );

  return await response.json();
};
