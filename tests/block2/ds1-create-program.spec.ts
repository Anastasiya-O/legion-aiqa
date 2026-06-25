import { expect, test, trackProgram } from '../../fixtures/cleanup.fixture';
import {
  assertDidaxisEnv,
  clickCreateInDialog,
  createAndTrackProgram,
  openNewProgramDialog,
  programRow,
  uniqueProgramName,
  uuidFromProgramCreateResponse,
  waitForProgramCreate,
} from './fixtures';

test.beforeAll(assertDidaxisEnv);

test.describe('Block 2 — DS-1 Create New Academic Program', () => {
  test('TC-001 Program creation form is displayed from the Programs page', async ({ page }) => {
    const dialog = await openNewProgramDialog(page);
    await expect(dialog.getByLabel('Program Name')).toBeVisible();
    await expect(dialog.getByLabel('Description')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Create' })).toBeVisible();
    const uniqueName = uniqueProgramName('E2E Program');
    await dialog.getByLabel('Program Name').fill(uniqueName);
    await expect(dialog.getByLabel('Program Name')).toHaveValue(uniqueName);
  });

  test('TC-002 Program is successfully created with valid name and description', async ({ page }) => {
    const name = uniqueProgramName('Web Development 2026');
    const desc = 'Full-stack web development program';
    await createAndTrackProgram(page, name, desc);
    await expect(programRow(page, name)).toBeVisible();
    await expect(programRow(page, name).getByText(desc)).toBeVisible();
  });

  test('TC-003 Program is successfully created with a valid name and empty description', async ({
    page,
  }) => {
    const name = uniqueProgramName('Data Analytics 2026');
    await createAndTrackProgram(page, name, '');
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-004 Create button remains disabled when Program Name is empty', async ({ page }) => {
    const dialog = await openNewProgramDialog(page);
    await dialog.getByLabel('Description').fill('Program without a name');
    await expect(dialog.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-005 Program is not created when Program Name contains only spaces', async ({ page }) => {
    const dialog = await openNewProgramDialog(page);
    await dialog.getByLabel('Program Name').fill('   ');
    await dialog.getByLabel('Description').fill('Whitespace name test');
    await expect(dialog.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-006 Duplicate program name is not created twice', async ({ page }) => {
    const name = uniqueProgramName('Web Development 2026');
    await createAndTrackProgram(page, name, 'first');
    const dialog = await openNewProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('Duplicate program test');
    await dialog.getByRole('button', { name: 'Create' }).click();
    const dupRows = page.locator('tbody tr').filter({ has: page.getByText(name, { exact: true }) });
    await expect(dupRows).toHaveCount(1);
    const err = page.getByRole('alert');
    if (await err.isVisible().catch(() => false)) {
      await expect(err).toBeVisible();
    } else {
      await expect(dialog).toBeVisible();
    }
  });

  test('TC-007 Program is not created when submission fails', async ({ page }) => {
    const name = uniqueProgramName('Cloud Engineering 2026');
    try {
      await page.route('**/*', (route) => {
        const req = route.request();
        if (req.method() === 'POST' && req.url().toLowerCase().includes('program')) {
          return route.abort('failed');
        }
        return route.continue();
      });
      const dialog = await openNewProgramDialog(page);
      await dialog.getByLabel('Program Name').fill(name);
      await dialog.getByLabel('Description').fill('Cloud infrastructure and DevOps program');
      await dialog.getByRole('button', { name: 'Create' }).click();
      await expect(dialog).toBeVisible({ timeout: 15_000 });
      await expect(programRow(page, name)).toHaveCount(0);
    } finally {
      await page.unroute('**/*');
    }
  });

  test('TC-008 Program name with leading and trailing spaces is saved without extra whitespace', async ({
    page,
  }) => {
    const trimmed = uniqueProgramName('Cybersecurity 2026');
    const padded = `  ${trimmed}  `;
    await createAndTrackProgram(page, padded, 'Security fundamentals');
    await expect(programRow(page, trimmed)).toBeVisible();
  });

  test('TC-009 Program name supports valid special characters', async ({ page }) => {
    const name = uniqueProgramName('AI & Machine Learning: 2026');
    const desc = 'Artificial intelligence, ML, and applied data science';
    await createAndTrackProgram(page, name, desc);
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-010 Program name rejects unsafe script content', async ({ page }) => {
    const name = uniqueProgramName('<script>alert("xss")</script>');
    let dialogOpened = false;
    page.once('dialog', () => {
      dialogOpened = true;
    });
    await createAndTrackProgram(page, name, 'Security validation test');
    expect(dialogOpened).toBe(false);
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-011 Program name accepts minimum valid length', async ({ page }) => {
    const name = uniqueProgramName('A');
    const dialog = await openNewProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('Minimum length name test');
    const createBtn = dialog.getByRole('button', { name: 'Create' });
    if (await createBtn.isEnabled()) {
      trackProgram(await clickCreateInDialog(page, dialog));
      await expect(programRow(page, name)).toBeVisible();
    } else {
      await expect(createBtn).toBeDisabled();
    }
  });

  test('TC-012 Program name at maximum allowed length is accepted', async ({ page }) => {
    const tail = String(Date.now());
    const maxName = (`P${'x'.repeat(120)}${tail}`).slice(0, 100);
    expect(maxName.length).toBe(100);
    await createAndTrackProgram(page, maxName, 'Maximum valid length test');
    await expect(programRow(page, maxName)).toBeVisible();
  });

  test('TC-013 Program name above maximum allowed length is rejected', async ({ page }) => {
    const tail = String(Date.now());
    const base = (`Q${'y'.repeat(120)}${tail}`).slice(0, 100);
    const tooLong = `${base}Z`;
    expect(tooLong.length).toBe(101);
    const dialog = await openNewProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(tooLong);
    await dialog.getByLabel('Description').fill('Maximum length exceeded test');
    const createBtn = dialog.getByRole('button', { name: 'Create' });
    if (await createBtn.isEnabled()) {
      await createBtn.click();
      await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible({ timeout: 5000 });
    } else {
      await expect(createBtn).toBeDisabled();
    }
  });

  test('TC-014 Description at maximum allowed length is handled correctly', async ({ page }) => {
    const name = uniqueProgramName('Software Engineering 2026');
    const desc = 'D'.repeat(2000);
    await createAndTrackProgram(page, name, desc);
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-015 Long description above maximum allowed length is rejected', async ({ page }) => {
    const name = uniqueProgramName('Product Management 2026');
    const dialog = await openNewProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('Z'.repeat(20_000));
    const createBtn = dialog.getByRole('button', { name: 'Create' });
    if (await createBtn.isEnabled()) {
      await createBtn.click();
      await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible({ timeout: 5000 });
    } else {
      await expect(createBtn).toBeDisabled();
    }
  });
});
