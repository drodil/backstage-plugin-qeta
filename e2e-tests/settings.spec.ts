import { expect, test } from '@playwright/test';
import { createQuestion, loginAsGuest } from './utils';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsGuest(page);

    // Reset all settings to ensure clean state before each test
    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    const resetButton = page.getByTestId('reset-all-settings-button');
    await resetButton.click();

    // Wait for reset to complete by checking that a view type shows default state
    const defaultButton = page.getByTestId('view-type-posts-question-default');
    await expect(defaultButton).toHaveAttribute('data-selected', 'true', {
      timeout: 3000,
    });

    await page.waitForTimeout(500);
  });

  test('change questions view type to grid and verify it persists', async ({
    page,
    request,
  }) => {
    await createQuestion(request);

    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    const gridButton = page.getByTestId('view-type-posts-question-grid');
    await gridButton.click();

    await expect(gridButton).toHaveAttribute('data-selected', 'true', {
      timeout: 2000,
    });
    await page.waitForTimeout(500);

    await page.goto('/qeta/questions');
    await page.waitForLoadState('networkidle');

    const viewToggleButtons = page.locator('button[aria-label*="Grid"]');
    await expect(viewToggleButtons.first()).toBeVisible();

    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const gridButtonAfter = page.getByTestId('view-type-posts-question-grid');
    const listButtonAfter = page.getByTestId('view-type-posts-question-list');

    await expect(gridButtonAfter).toHaveAttribute('data-selected', 'true', {
      timeout: 10000,
    });
    await expect(listButtonAfter).toHaveAttribute('data-selected', 'false');
  });

  test('change questions view type to list and verify it persists', async ({
    page,
    request,
  }) => {
    await createQuestion(request);

    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    const listButton = page.getByTestId('view-type-posts-question-list');
    await listButton.click();

    await expect(listButton).toHaveAttribute('data-selected', 'true', {
      timeout: 2000,
    });
    await page.waitForTimeout(500);

    await page.goto('/qeta/questions');
    await page.waitForLoadState('networkidle');

    const viewToggleButtons = page.locator('button[aria-label*="List"]');
    await expect(viewToggleButtons.first()).toBeVisible();

    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const listButtonAfter = page.getByTestId('view-type-posts-question-list');
    const gridButtonAfter = page.getByTestId('view-type-posts-question-grid');

    await expect(listButtonAfter).toHaveAttribute('data-selected', 'true', {
      timeout: 10000,
    });
    await expect(gridButtonAfter).toHaveAttribute('data-selected', 'false');
  });

  test('change multiple view types and verify they all persist', async ({
    page,
  }) => {
    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('view-type-posts-question-grid').click();
    await page.waitForTimeout(200);

    await page.getByTestId('view-type-posts-article-list').click();
    await page.waitForTimeout(200);

    await page.getByTestId('view-type-posts-link-grid').click();
    await page.waitForTimeout(200);

    await page.reload();
    await page.waitForLoadState('networkidle');

    const questionsGridButton = page.getByTestId(
      'view-type-posts-question-grid',
    );
    await expect(questionsGridButton).toHaveAttribute('data-selected', 'true');

    const articlesListButton = page.getByTestId('view-type-posts-article-list');
    await expect(articlesListButton).toHaveAttribute('data-selected', 'true');

    const linksGridButton = page.getByTestId('view-type-posts-link-grid');
    await expect(linksGridButton).toHaveAttribute('data-selected', 'true');
  });

  test('toggle auto-save setting and verify it persists', async ({ page }) => {
    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    const autoSaveSwitch = page.getByTestId('auto-save-switch');

    const initialChecked = await autoSaveSwitch.isChecked();

    await autoSaveSwitch.click();
    await page.waitForTimeout(500);

    const newChecked = await autoSaveSwitch.isChecked();
    expect(newChecked).toBe(!initialChecked);

    await page.reload();
    await page.waitForLoadState('networkidle');

    const autoSaveSwitchAfter = page.getByTestId('auto-save-switch');
    const persistedChecked = await autoSaveSwitchAfter.isChecked();
    expect(persistedChecked).toBe(newChecked);

    await autoSaveSwitchAfter.click();
    await page.waitForTimeout(500);
  });

  test('toggle pagination setting and verify it persists', async ({ page }) => {
    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    const paginationSwitch = page.getByTestId('pagination-switch');

    const initialChecked = await paginationSwitch.isChecked();

    await paginationSwitch.click();
    await page.waitForTimeout(1000);

    const newChecked = await paginationSwitch.isChecked();
    expect(newChecked).toBe(!initialChecked);

    await page.goto('/qeta/questions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const paginationSwitchAfter = page.getByTestId('pagination-switch');

    await expect(async () => {
      const persistedChecked = await paginationSwitchAfter.isChecked();
      expect(persistedChecked).toBe(newChecked);
    }).toPass({ timeout: 10000, intervals: [1000, 2000] });

    await paginationSwitchAfter.click();
    await page.waitForTimeout(500);
  });

  test('toggle anonymous posting setting and verify it persists', async ({
    page,
  }) => {
    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    const anonymousSwitch = page.getByTestId('anonymous-posting-switch');
    const isAnonymousFeatureAvailable = await anonymousSwitch.isVisible();

    if (!isAnonymousFeatureAvailable) {
      console.log('Anonymous posting feature not enabled, skipping test');
      return;
    }

    const initialChecked = await anonymousSwitch.isChecked();

    if (!initialChecked) {
      await anonymousSwitch.click();
      await page.waitForTimeout(500);
    }

    const enabledChecked = await anonymousSwitch.isChecked();
    expect(enabledChecked).toBe(true);

    await page.goto('/qeta/questions/ask');
    await page.waitForLoadState('networkidle');

    const formAnonymousCheckbox = page.getByTestId('post-anonymously-checkbox');

    await expect(formAnonymousCheckbox).toBeChecked();

    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    const anonymousSwitchAgain = page.getByTestId('anonymous-posting-switch');
    await anonymousSwitchAgain.click();
    await page.waitForTimeout(500);

    const disabledChecked = await anonymousSwitchAgain.isChecked();
    expect(disabledChecked).toBe(false);

    await page.goto('/qeta/questions/ask');
    await page.waitForLoadState('networkidle');

    const formAnonymousCheckboxDisabled = page.getByTestId(
      'post-anonymously-checkbox',
    );

    await expect(formAnonymousCheckboxDisabled).not.toBeChecked();

    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    const anonymousSwitchAfter = page.getByTestId('anonymous-posting-switch');
    const persistedChecked = await anonymousSwitchAfter.isChecked();
    expect(persistedChecked).toBe(false);

    if (initialChecked) {
      await anonymousSwitchAfter.click();
      await page.waitForTimeout(500);
    }
  });

  test('reset view type to default and verify it persists', async ({
    page,
  }) => {
    await page.goto('/qeta/settings');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('view-type-posts-question-grid').click();
    await page.waitForTimeout(200);

    await page.getByTestId('view-type-posts-question-default').click();
    await page.waitForTimeout(500);

    await page.reload();
    await page.waitForLoadState('networkidle');

    const defaultButton = page.getByTestId('view-type-posts-question-default');
    await expect(defaultButton).toHaveAttribute('data-selected', 'true');
  });
});
