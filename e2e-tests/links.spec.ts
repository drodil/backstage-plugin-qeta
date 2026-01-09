import { test, expect } from '@playwright/test';
import { loginAsGuest, createLink } from './utils';
import { faker } from '@faker-js/faker';

test.describe.serial('Links', () => {
  const title = `${faker.lorem.sentence()} ${faker.string.uuid()}`;
  const content = faker.lorem.paragraphs(1);
  const tags = [faker.word.adjective(), faker.word.adjective()];
  const url = faker.internet.url();

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsGuest(page);
  });

  test('post a new link', async ({ page }) => {
    await page.goto('/qeta/links/create');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="url"]').fill(url);
    await page.locator('input[name="title"]').fill(title);
    await page.locator('.mde-text').fill(content);

    const tagsInput = page.getByRole('textbox', { name: 'Tags' });
    await tagsInput.click();
    await tagsInput.fill(tags[0]);
    await page.waitForTimeout(500);
    await tagsInput.press('Enter');

    await page.getByRole('button', { name: /Publish|Post/i }).click();

    await expect(page).toHaveURL(/\/qeta\/links\/\d+/);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  });

  test('list the link', async ({ page }) => {
    await page.goto('/qeta/links?orderBy=created&order=desc');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10000 });
  });

  test('search for a link', async ({ page }) => {
    await page.goto('/qeta/links');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByRole('textbox', { name: /Search/i });

    const partialTitle = title.split(' ')[0];
    await searchInput.fill(partialTitle);
    await page.waitForTimeout(1000);
    await expect(page.getByText(title).first()).toBeVisible();

    await page.getByRole('button', { name: /clear/i }).first().click();
    await expect(searchInput).toHaveValue('');

    const partialContent = content.split(' ')[0];
    await searchInput.fill(partialContent);
    await page.waitForTimeout(1000);
    await expect(page.getByText(title).first()).toBeVisible();
  });

  test('increase view count', async ({ page, request }) => {
    const { title } = await createLink(request);

    await page.goto('/qeta/links?orderBy=created&order=desc');
    await page.waitForLoadState('networkidle');

    const postRow = page
      .locator(`a[aria-label="${title}"]`)
      .first()
      .locator('..');

    const viewsItem = postRow.locator('[title^="Viewed"]');
    await expect(viewsItem).toBeVisible();

    const initialTitle = await viewsItem.getAttribute('title');
    const initialViews = parseInt(initialTitle?.replace(/\D/g, '') || '0', 10);

    await page.locator(`a[aria-label="${title}"]`).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    await page.goto('/qeta/links?orderBy=created&order=desc');
    await page.waitForLoadState('networkidle');

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

  test('open link button functionality', async ({ page, context, request }) => {
    const { title, url } = await createLink(request);

    await page.goto('/qeta/links?orderBy=created&order=desc');
    await page.waitForLoadState('networkidle');

    const postRow = page
      .locator(`a[aria-label="${title}"]`)
      .first()
      .locator('..');
    const openLinkBtn = postRow
      .getByRole('link', { name: /Open link/i })
      .first();

    await expect(openLinkBtn).toBeVisible();

    await expect(openLinkBtn).toHaveAttribute('target', '_blank');
    await expect(openLinkBtn).toHaveAttribute('rel', 'noopener noreferrer');

    const initialUrl = page.url();

    await openLinkBtn.click();

    await page.waitForTimeout(1000);
    expect(page.url()).toBe(initialUrl);
  });
});
