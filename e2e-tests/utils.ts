import { Page, expect } from '@playwright/test';

export async function loginAsGuest(page: Page) {
  const enterButton = page.getByRole('button', { name: 'Enter' });

  try {
    await enterButton.waitFor({ state: 'visible', timeout: 5000 });
    await enterButton.click();
    await expect(enterButton).not.toBeVisible();
  } catch (e) {}
}
