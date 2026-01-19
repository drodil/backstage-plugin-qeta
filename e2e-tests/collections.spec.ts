import { expect, test } from '@playwright/test';
import { createQuestion, loginAsGuest } from './utils';
import { faker } from '@faker-js/faker';

test.describe('Collections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsGuest(page);
  });

  test('create automatic collection by author', async ({ page, request }) => {
    const title = `Auto Collection ${faker.string.uuid()}`;
    await page.goto('/qeta/collections/create');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="title"]').fill(title);
    await page.locator('.mde-text').fill(faker.lorem.sentence());

    const usersInput = page.getByRole('textbox', { name: 'Automatic Users' });
    await expect(usersInput).toBeVisible();
    await usersInput.click();

    await usersInput.fill('guest');

    await expect(page.getByRole('listbox')).toBeVisible();
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: 'Create Collection' }).click();

    await expect(page).toHaveURL(/\/qeta\/collections\/\d+/);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    const postTitle = `Auto Post ${faker.string.uuid()}`;
    await createQuestion(request, {
      title: postTitle,
      user: 'user:development/guest',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: postTitle })).toBeVisible();
  });

  test('create automatic collection by tags', async ({ page, request }) => {
    const title = `Auto Tag Collection ${faker.string.uuid()}`;
    const tag = `tag${faker.string.alphanumeric(5)}`;
    await page.goto('/qeta/collections/create');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="title"]').fill(title);
    await page.locator('.mde-text').fill(faker.lorem.sentence());

    const tagsInput = page.getByRole('textbox', { name: 'Automatic Tags' });
    await tagsInput.click();
    await tagsInput.fill(tag);
    await page.waitForTimeout(1000);
    await tagsInput.press('Enter');

    await page.getByRole('button', { name: 'Create Collection' }).click();

    await expect(page).toHaveURL(/\/qeta\/collections\/\d+/);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    const postTitle = `Auto Tag Post ${faker.string.uuid()}`;
    await createQuestion(request, {
      title: postTitle,
      tags: [tag],
      user: 'user:development/guest',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: postTitle })).toBeVisible();
  });

  test('create automatic collection by entities', async ({ page, request }) => {
    const title = `Auto Entity Collection ${faker.string.uuid()}`;
    await page.goto('/qeta/collections/create');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="title"]').fill(title);
    await page.locator('.mde-text').fill(faker.lorem.sentence());

    const entitiesInput = page.getByRole('textbox', {
      name: 'Automatic Entities',
    });
    await entitiesInput.click();
    await entitiesInput.fill('test component 2');

    const option = page.getByRole('option', { name: /test component 2/i });
    await expect(option).toBeVisible();
    await option.click();

    await page.getByRole('button', { name: 'Create Collection' }).click();

    await expect(page).toHaveURL(/\/qeta\/collections\/\d+/);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    const postTitle = `Auto Entity Post ${faker.string.uuid()}`;
    await createQuestion(request, {
      title: postTitle,
      entities: ['component:default/test-component-2'],
      user: 'user:development/guest',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByRole('link', { name: postTitle })).toBeVisible({
      timeout: 10000,
    });
  });

  test('create automatic collection with combined rules (OR logic)', async ({
    page,
    request,
  }) => {
    const title = `Combined Collection ${faker.string.uuid()}`;
    const tag = `combined${faker.string.alphanumeric(5)}`;

    await page.goto('/qeta/collections/create');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="title"]').fill(title);
    await page.locator('.mde-text').fill(faker.lorem.sentence());

    const usersInput = page.getByRole('textbox', { name: 'Automatic Users' });
    await usersInput.click();
    await usersInput.fill('guest');
    const userOption = page.getByRole('option').first();
    await expect(userOption).toBeVisible();
    await userOption.click();

    const tagsInput = page.getByRole('textbox', { name: 'Automatic Tags' });
    await tagsInput.click();
    await tagsInput.fill(tag);
    await page.waitForTimeout(1000);
    await tagsInput.press('Enter');

    await page.getByRole('button', { name: 'Create Collection' }).click();

    await expect(page).toHaveURL(/\/qeta\/collections\/\d+/);

    const postTitleUser = `Combined User Post ${faker.string.uuid()}`;
    await createQuestion(request, {
      title: postTitleUser,
      user: 'user:development/guest',
    });

    const postTitleTag = `Combined Tag Post ${faker.string.uuid()}`;
    await createQuestion(request, {
      title: postTitleTag,
      tags: [tag],
      user: 'user:default/user2',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: postTitleUser })).toBeVisible();
    await expect(page.getByRole('link', { name: postTitleTag })).toBeVisible();
  });
});
