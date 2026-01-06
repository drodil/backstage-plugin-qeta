import { test, expect } from '@playwright/test';
import { loginAsGuest } from './utils';

test('qeta plugin link is visible', async ({ page }) => {
  await page.goto('/');

  await loginAsGuest(page);

  const link = page.getByRole('link', { name: 'Q&A' });
  await expect(link).toBeVisible();
});
