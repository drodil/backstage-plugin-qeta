import { test, expect } from '@playwright/test';
import { loginAsGuest, createQuestion, createAnswer } from './utils';
import { faker } from '@faker-js/faker';

test.describe.serial('Questions', () => {
  let questionId: string;
  const title = `${faker.lorem.sentence()} ${faker.string.uuid()}`;
  const content = faker.lorem.paragraphs(3);
  const tags = [faker.word.adjective(), faker.word.adjective()];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsGuest(page);
  });

  test('post a new question', async ({ page }) => {
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
    await tagsInput.fill(tags[0]);
    await page.waitForTimeout(500);
    await tagsInput.press('Enter');

    await expect(page.getByText(tags[0], { exact: true })).toBeVisible();

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
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(title).first()).toBeVisible({ timeout: 10000 });
  });

  test('search for a question', async ({ page }) => {
    await page.goto('/qeta/questions');
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

  test('increase view count', async ({ page, request }) => {
    const { title } = await createQuestion(request);

    await page.goto('/qeta/questions?orderBy=created&order=desc');
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

    await page.goto('/qeta/questions?orderBy=created&order=desc');
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

  test('mark answer as correct', async ({ page, request }) => {
    const { id: questionId } = await createQuestion(request, {
      user: 'user:development/guest',
    });

    const { id: answer1Id } = await createAnswer(request, questionId, {
      content: faker.lorem.paragraph(),
      user: 'user:default/user2',
    });
    const { id: answer2Id } = await createAnswer(request, questionId, {
      content: faker.lorem.paragraph(),
      user: 'user:default/user2',
    });

    await page.goto(`/qeta/questions/${questionId}`);
    await page.waitForLoadState('networkidle');

    const answer1 = page.locator(`div#answer_${answer1Id}`);
    const answer2 = page.locator(`div#answer_${answer2Id}`);

    const markCorrectBtn1 = answer1.locator(
      'button[aria-label="mark correct"]',
    );
    const markCorrectBtn2 = answer2.locator(
      'button[aria-label="mark correct"]',
    );

    await expect(markCorrectBtn1).toBeVisible();
    await expect(markCorrectBtn2).toBeVisible();

    await markCorrectBtn1.click();
    await page.waitForLoadState('networkidle');

    await expect(markCorrectBtn1).toHaveAttribute(
      'data-testid',
      'mark-correct-answer-btn-checked',
    );

    await expect(markCorrectBtn2).toHaveAttribute(
      'data-testid',
      'mark-correct-answer-btn-unchecked',
    );

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(markCorrectBtn1).toHaveAttribute(
      'data-testid',
      'mark-correct-answer-btn-checked',
    );
    await expect(markCorrectBtn2).toHaveAttribute(
      'data-testid',
      'mark-correct-answer-btn-unchecked',
    );
  });

  test('vote answer', async ({ page, request }) => {
    const { id: questionId } = await createQuestion(request, {
      user: 'user:development/guest',
    });

    const { id: answer1Id } = await createAnswer(request, questionId, {
      content: faker.lorem.paragraph(),
      user: 'user:default/user2',
    });

    await page.goto(`/qeta/questions/${questionId}`);
    await page.waitForLoadState('networkidle');

    const answer1 = page.locator(`div#answer_${answer1Id}`);

    const voteUpBtn = answer1.locator('[data-testid^="vote-up-btn"]');
    const voteCount = answer1.locator('[data-testid="vote-count"]');

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

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(voteUpBtn).toHaveAttribute(
      'data-testid',
      'vote-up-btn-selected',
    );
    await expect(voteCount).toHaveText('1');

    const voteDownBtn = answer1.locator('[data-testid^="vote-down-btn"]');
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

  test('vote question', async ({ page, request }) => {
    const { id: questionId } = await createQuestion(request, {
      user: 'user:default/user2',
    });

    await page.goto(`/qeta/questions/${questionId}`);
    await page.waitForLoadState('networkidle');

    const questionCard = page.locator('[data-testid="question-card"]');
    const voteUpBtn = questionCard.locator('[data-testid^="vote-up-btn"]');
    const voteDownBtn = questionCard.locator('[data-testid^="vote-down-btn"]');
    const voteCount = questionCard.locator('[data-testid="vote-count"]');

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
