import { test, expect } from '@playwright/test';
import { loginAsGuest } from './utils';
import { faker } from '@faker-js/faker';

test.describe.serial('Questions', () => {
  let questionId: string;
  let title: string;
  let content: string;
  let tag: string;

  test.beforeAll(() => {
    title = `${faker.word.words(3)} ${faker.string.uuid()}`;
    content = faker.lorem.paragraph();
    tag = faker.word.sample().replace(/[^a-zA-Z0-9]/g, '');
  });

  test('post a new question', async ({ page }) => {
    await page.goto('/');
    await loginAsGuest(page);

    await page.goto('/qeta/questions/ask');
    await page.waitForLoadState('networkidle');

    const titleInput = page.locator('input[name="title"]');
    await titleInput.click();
    await titleInput.fill(title);
    await expect(titleInput).toHaveValue(title);

    const contentInput = page.locator('.mde-text');
    await contentInput.fill(content);

    const tagsInput = page.getByRole('textbox', { name: 'Tags' });
    await tagsInput.click();
    await tagsInput.fill(tag);
    await page.waitForTimeout(500);
    await tagsInput.press('Enter');

    await expect(page.getByText(tag, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Publish|Post/i }).click();

    await expect(page).toHaveURL(/\/qeta\/questions\/\d+/);

    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    const url = page.url();
    const match = url.match(/\/qeta\/questions\/(\d+)/);
    if (match) {
      questionId = match[1];
    } else {
      throw new Error('Could not capture questionId from URL');
    }
  });

  test('list the question', async ({ page }) => {
    await page.goto('/qeta/questions?orderBy=created&order=desc');
    await loginAsGuest(page);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10000 });
  });
});
