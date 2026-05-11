import { expect, test, type Page } from '@playwright/test';

const TODO_MVC = 'https://demo.playwright.dev/todomvc/#/';

async function openCleanApp(page: Page) {
  await page.goto(TODO_MVC);
  await page.evaluate(() => localStorage.clear());
  await page.goto(TODO_MVC);
}

async function addTodo(page: Page, text: string) {
  await page.locator('.new-todo').fill(text);
  await page.locator('.new-todo').press('Enter');
}

function rowByLabel(page: Page, label: string) {
  return page.locator('.todo-list li').filter({ has: page.getByText(label, { exact: true }) });
}

test.beforeEach(async ({ page }) => {
  await openCleanApp(page);
});

test.describe('Positive flows', () => {
  test('TC-001 empty list shows capture UI without todo rows or list chrome', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('todos');
    await expect(page.locator('.new-todo')).toHaveAttribute('placeholder', 'What needs to be done?');
    await expect(page.locator('.todo-list li')).toHaveCount(0);
    await expect(page.locator('.footer')).not.toBeVisible();
  });

  test('TC-002 first submitted todo appears as a single active row', async ({ page }) => {
    await addTodo(page, 'Buy oat milk');
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(rowByLabel(page, 'Buy oat milk').locator('label')).toHaveText('Buy oat milk');
    await expect(rowByLabel(page, 'Buy oat milk')).not.toHaveClass(/completed/);
    await expect(page.locator('.todo-count')).toHaveText('1 item left');
    await expect(page.getByRole('link', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Active' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Completed' })).toBeVisible();
  });

  test('TC-003 user can add four distinct todos in creation order', async ({ page }) => {
    await addTodo(page, 'Pay electricity bill');
    await addTodo(page, 'Book dentist');
    await addTodo(page, 'Reply to Alex');
    await addTodo(page, 'Water plants');
    await expect(page.locator('.todo-list li')).toHaveCount(4);
    await expect(page.locator('.todo-list li label')).toHaveText([
      'Pay electricity bill',
      'Book dentist',
      'Reply to Alex',
      'Water plants',
    ]);
    await expect(page.locator('.todo-count')).toHaveText('4 items left');
  });

  test('TC-004 completing one todo marks it finished; others stay active', async ({ page }) => {
    await addTodo(page, 'Pay electricity bill');
    await addTodo(page, 'Book dentist');
    await addTodo(page, 'Reply to Alex');
    await addTodo(page, 'Water plants');
    await rowByLabel(page, 'Book dentist').locator('.toggle').check();
    await expect(rowByLabel(page, 'Book dentist')).toHaveClass(/completed/);
    await expect(rowByLabel(page, 'Book dentist').locator('.toggle')).toBeChecked();
    for (const label of ['Pay electricity bill', 'Reply to Alex', 'Water plants']) {
      await expect(rowByLabel(page, label)).not.toHaveClass(/completed/);
      await expect(rowByLabel(page, label).locator('.toggle')).not.toBeChecked();
    }
    await expect(page.locator('.todo-count')).toHaveText('3 items left');
  });

  test('TC-005 destroy removes only the targeted todo', async ({ page }) => {
    await addTodo(page, 'Pay electricity bill');
    await addTodo(page, 'Book dentist');
    await addTodo(page, 'Reply to Alex');
    await addTodo(page, 'Water plants');
    await rowByLabel(page, 'Book dentist').locator('.toggle').check();
    await rowByLabel(page, 'Reply to Alex').hover();
    await rowByLabel(page, 'Reply to Alex').locator('.destroy').click();
    await expect(page.locator('.todo-list li')).toHaveCount(3);
    await expect(rowByLabel(page, 'Reply to Alex')).toHaveCount(0);
    await expect(page.locator('.todo-list li label')).toHaveText([
      'Pay electricity bill',
      'Book dentist',
      'Water plants',
    ]);
    await expect(page.locator('.todo-count')).toHaveText('2 items left');
  });

  test('TC-006 Clear completed removes finished rows only', async ({ page }) => {
    await addTodo(page, 'Walk dog');
    await addTodo(page, 'Read chapter 4');
    await rowByLabel(page, 'Walk dog').locator('.toggle').check();
    await expect(page.locator('.clear-completed')).toBeVisible();
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(rowByLabel(page, 'Walk dog')).toHaveCount(0);
    await expect(rowByLabel(page, 'Read chapter 4')).toBeVisible();
    await expect(page.locator('.clear-completed')).not.toBeVisible();
  });

  test('TC-007 Active filter shows only active; All restores full list', async ({ page }) => {
    await addTodo(page, 'Alpha');
    await addTodo(page, 'Beta');
    await rowByLabel(page, 'Beta').locator('.toggle').check();
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li label')).toHaveText('Alpha');
    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(rowByLabel(page, 'Beta')).toHaveClass(/completed/);
    await expect(rowByLabel(page, 'Alpha')).not.toHaveClass(/completed/);
  });

  test('TC-008 double-click edit updates label after Enter', async ({ page }) => {
    await addTodo(page, 'edit me');
    await rowByLabel(page, 'edit me').locator('label').dblclick();
    const edit = rowByLabel(page, 'edit me').locator('.edit');
    await edit.fill('edited');
    await edit.press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(rowByLabel(page, 'edited').locator('label')).toHaveText('edited');
  });
});

test.describe('Negative flows', () => {
  test('TC-009 Enter on empty new-todo does not create a row', async ({ page }) => {
    await page.locator('.new-todo').press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(0);
    await expect(page.locator('.footer')).not.toBeVisible();
  });

  test('TC-010 whitespace-only submission does not create a todo', async ({ page }) => {
    await page.locator('.new-todo').fill('   ');
    await page.locator('.new-todo').press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-011 completing one todo does not auto-complete sibling', async ({ page }) => {
    await addTodo(page, 'Only A');
    await addTodo(page, 'Only B');
    await rowByLabel(page, 'Only A').locator('.toggle').check();
    await expect(rowByLabel(page, 'Only A')).toHaveClass(/completed/);
    await expect(rowByLabel(page, 'Only B')).not.toHaveClass(/completed/);
    await expect(rowByLabel(page, 'Only B').locator('.toggle')).not.toBeChecked();
  });

  test('TC-012 destroy on one row does not remove the other', async ({ page }) => {
    await addTodo(page, 'Keep');
    await addTodo(page, 'Drop');
    await rowByLabel(page, 'Drop').hover();
    await rowByLabel(page, 'Drop').locator('.destroy').click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(rowByLabel(page, 'Keep')).toBeVisible();
    await expect(rowByLabel(page, 'Drop')).toHaveCount(0);
  });

  test('TC-013 switching filters does not delete todos', async ({ page }) => {
    await addTodo(page, 'Done task');
    await addTodo(page, 'Open task');
    await rowByLabel(page, 'Done task').locator('.toggle').check();
    await page.getByRole('link', { name: 'Completed' }).click();
    await page.getByRole('link', { name: 'Active' }).click();
    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(rowByLabel(page, 'Done task')).toHaveClass(/completed/);
    await expect(rowByLabel(page, 'Open task')).not.toHaveClass(/completed/);
  });
});

test.describe('Edge cases', () => {
  test('TC-014 duplicate titles are separate rows', async ({ page }) => {
    await addTodo(page, 'Same text');
    await addTodo(page, 'Same text');
    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-list li label')).toHaveText(['Same text', 'Same text']);
    await expect(page.locator('.todo-count')).toHaveText('2 items left');
  });

  test('TC-015 very long text is stored without truncation', async ({ page }) => {
    const long = 'x'.repeat(5000);
    await addTodo(page, long);
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li label')).toHaveText(long);
  });

  test('TC-016 angle-bracket text shows as literal; no dialog', async ({ page }) => {
    let dialogSeen = false;
    page.on('dialog', () => {
      dialogSeen = true;
    });
    const payload = '<script>alert(1)</script>';
    await addTodo(page, payload);
    await expect(page.locator('.todo-list li label')).toHaveText(payload);
    expect(dialogSeen).toBe(false);
  });

  test('TC-017 counter singular and plural', async ({ page }) => {
    await addTodo(page, 'one');
    await expect(page.locator('.todo-count')).toHaveText('1 item left');
    await addTodo(page, 'two');
    await expect(page.locator('.todo-count')).toHaveText('2 items left');
  });

  test('TC-018 rapid sequential adds preserve order and count', async ({ page }) => {
    const input = page.locator('.new-todo');
    for (const t of ['T1', 'T2', 'T3', 'T4']) {
      await input.fill(t);
      await input.press('Enter');
    }
    await expect(page.locator('.todo-list li label')).toHaveText(['T1', 'T2', 'T3', 'T4']);
    await expect(page.locator('.todo-count')).toHaveText('4 items left');
  });

  test('TC-019 unchecking completed returns to active; visible under Active filter', async ({
    page,
  }) => {
    await addTodo(page, 'Reopen me');
    await rowByLabel(page, 'Reopen me').locator('.toggle').check();
    await expect(rowByLabel(page, 'Reopen me')).toHaveClass(/completed/);
    await rowByLabel(page, 'Reopen me').locator('.toggle').uncheck();
    await expect(rowByLabel(page, 'Reopen me')).not.toHaveClass(/completed/);
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(rowByLabel(page, 'Reopen me')).toBeVisible();
    await expect(page.locator('.todo-count')).toHaveText('1 item left');
  });
});
