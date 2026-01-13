import { expect, test } from '@playwright/test';
import { createArticle, loginAsGuest } from './utils';
import { faker } from '@faker-js/faker';

test.describe.serial('Articles - Form Flow', () => {
  const title = `${faker.lorem.sentence()} ${faker.string.uuid()}`;
  const content = faker.lorem.paragraphs(3);
  const tags = [faker.word.adjective(), faker.word.adjective()];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsGuest(page);
  });

  test('post a new article', async ({ page }) => {
    await page.goto('/qeta/articles/write');
    await page.waitForLoadState('networkidle');

    const titleInput = page.locator('input[name="title"]');
    await titleInput.click();
    await titleInput.fill(title);
    await expect(titleInput).toHaveValue(title);

    const contentInput = page.locator('.mde-text');
    await contentInput.fill(content);

    const tagsInput = page.getByRole('textbox', { name: 'Tags' });
    await tagsInput.click();
    await tagsInput.fill(tags[0]);
    await page.waitForTimeout(500);
    await tagsInput.press('Enter');

    await expect(page.getByText(tags[0], { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Publish', exact: true }).click();

    await expect(page).toHaveURL(/\/qeta\/articles\/\d+/);

    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  });

  test('list the article', async ({ page }) => {
    await page.goto('/qeta/articles?orderBy=created&order=desc');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10000 });
  });

  test('search for an article', async ({ page }) => {
    await page.goto('/qeta/articles');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByRole('textbox', { name: /Search/i });

    const partialTitle = title.split(' ')[0];
    await searchInput.fill(partialTitle);
    await page.waitForTimeout(1000);
    await expect(page.getByText(title).first()).toBeVisible();

    await page.getByRole('button', { name: /clear/i }).click();
    await expect(searchInput).toHaveValue('');

    const partialContent = content.split(' ')[0];
    await searchInput.fill(partialContent);
    await page.waitForTimeout(1000);
    await expect(page.getByText(title).first()).toBeVisible();
  });
});

test.describe('Articles - Independent Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsGuest(page);
  });

  test('increase view count', async ({ page, request }) => {
    const { title } = await createArticle(request);

    await page.goto('/qeta/articles?orderBy=created&order=desc');
    await page.waitForLoadState('networkidle');
    const listButton = page.getByRole('button', { name: 'List View' });
    await expect(listButton).toBeVisible({ timeout: 10000 });
    await listButton.click();
    await page.waitForTimeout(500);

    const postRow = page
      .locator(`a[aria-label="${title}"]`)
      .first()
      .locator('..');

    const viewsItem = postRow.locator('[title^="Viewed"]');
    await expect(viewsItem).toBeVisible({ timeout: 10000 });

    const initialTitle = await viewsItem.getAttribute('title');
    const initialViews = parseInt(initialTitle?.replace(/\D/g, '') || '0', 10);

    await page.locator(`a[aria-label="${title}"]`).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    await page.goto('/qeta/articles?orderBy=created&order=desc');
    await page.waitForLoadState('networkidle');

    const listButtonAfter = page.getByRole('button', { name: 'List View' });
    if (await listButtonAfter.isVisible()) {
      await listButtonAfter.click();
      await page.waitForTimeout(500);
    }

    const updatedPostRow = page
      .locator(`a[aria-label="${title}"]`)
      .first()
      .locator('..');
    const updatedViewsItem = updatedPostRow.locator('[title^="Viewed"]');

    await expect(async () => {
      await expect(updatedViewsItem).toBeVisible();
      const updatedTitle = await updatedViewsItem.getAttribute('title');
      const updatedViews = parseInt(
        updatedTitle?.replace(/\D/g, '') || '0',
        10,
      );
      expect(updatedViews).toBe(initialViews + 1);
    }).toPass({ timeout: 10000 });
  });

  test('vote article', async ({ page, request }) => {
    const { id: articleId } = await createArticle(request, {
      user: 'user:default/user2',
    });

    await page.goto(`/qeta/articles/${articleId}`);
    await page.waitForLoadState('networkidle');

    const voteUpBtn = page.locator('[data-testid^="vote-up-btn"]');
    const voteDownBtn = page.locator('[data-testid^="vote-down-btn"]');
    const voteCount = page.locator('[data-testid="vote-count"]');

    await expect(voteUpBtn).toHaveAttribute(
      'data-testid',
      'vote-up-btn-unselected',
    );
    await expect(voteCount).toHaveText('0');

    await voteUpBtn.click();
    await page.waitForLoadState('networkidle');

    await expect(voteUpBtn).toHaveAttribute(
      'data-testid',
      'vote-up-btn-selected',
    );
    await expect(voteCount).toHaveText('1');

    await voteUpBtn.click();
    await page.waitForLoadState('networkidle');

    await expect(voteUpBtn).toHaveAttribute(
      'data-testid',
      'vote-up-btn-unselected',
    );
    await expect(voteCount).toHaveText('0');

    await voteDownBtn.click();
    await page.waitForLoadState('networkidle');

    await expect(voteDownBtn).toHaveAttribute(
      'data-testid',
      'vote-down-btn-selected',
    );
    await expect(voteUpBtn).toHaveAttribute(
      'data-testid',
      'vote-up-btn-unselected',
    );
    await expect(voteCount).toHaveText('-1');

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(voteDownBtn).toHaveAttribute(
      'data-testid',
      'vote-down-btn-selected',
    );
    await expect(voteCount).toHaveText('-1');
  });
});
