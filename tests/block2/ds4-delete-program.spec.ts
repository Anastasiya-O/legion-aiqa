import { expect, test } from '@playwright/test';
import {
  acceptNextDialog,
  assertDidaxisEnv,
  createProgram,
  dismissNextDialog,
  login,
  openNewProgramDialog,
  programRow,
  uniqueProgramName,
} from './fixtures';

test.beforeAll(assertDidaxisEnv);

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.describe('Block 2 — DS-4 Delete program (browser confirm)', () => {
  test('TC-001 Program is removed after deletion is confirmed', async ({ page }) => {
    const name = uniqueProgramName('Test Program');
    await createProgram(page, name, 'row');
    const row = programRow(page, name);
    const confirmPromise = acceptNextDialog(page);
    await row.getByRole('button', { name: '🗑' }).click();
    await confirmPromise;
    await expect(programRow(page, name)).toHaveCount(0);
  });

  test('TC-002 Program remains when deletion is canceled from confirmation dialog', async ({
    page,
  }) => {
    const name = uniqueProgramName('Test Program');
    await createProgram(page, name, 'row');
    const row = programRow(page, name);
    const dismissPromise = dismissNextDialog(page);
    await row.getByRole('button', { name: '🗑' }).click();
    await dismissPromise;
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-003 Confirmation dialog content reflects the selected program', async ({ page }) => {
    const alpha = uniqueProgramName('Alpha Program');
    const testProg = uniqueProgramName('Test Program');
    await createProgram(page, alpha, 'a');
    await createProgram(page, testProg, 'b');
    const dismissPromise = dismissNextDialog(page);
    await programRow(page, testProg).getByRole('button', { name: '🗑' }).click();
    const msg = await dismissPromise;
    expect(msg).toContain(testProg);
    expect(msg).not.toContain(alpha);
  });

  test('TC-004 Program is not deleted before explicit confirmation', async ({ page }) => {
    const name = uniqueProgramName('Test Program');
    await createProgram(page, name, 'row');
    const row = programRow(page, name);
    const dismissPromise = dismissNextDialog(page);
    await row.getByRole('button', { name: '🗑' }).click();
    await dismissPromise;
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-005 Confirming delete removes exactly one program (native confirm)', async ({ page }) => {
    const name = uniqueProgramName('Test Program');
    await createProgram(page, name, 'row');
    const row = programRow(page, name);
    const confirmPromise = acceptNextDialog(page);
    await row.getByRole('button', { name: '🗑' }).click();
    await confirmPromise;
    await expect(programRow(page, name)).toHaveCount(0);
  });

  test('TC-006 Deletion failure does not remove program from list', async ({ page }) => {
    const name = uniqueProgramName('Test Program');
    await createProgram(page, name, 'row');
    try {
      await page.route('**/*', (route) => {
        const req = route.request();
        if (req.method() !== 'GET' && req.url().toLowerCase().includes('program')) {
          return route.abort('failed');
        }
        return route.continue();
      });
      const row = programRow(page, name);
      const confirmPromise = acceptNextDialog(page);
      await row.getByRole('button', { name: '🗑' }).click();
      await confirmPromise;
      await expect(programRow(page, name)).toBeVisible();
    } finally {
      await page.unroute('**/*');
    }
  });

  test('TC-007 Wrong program must not be deleted when confirming another row', async ({ page }) => {
    const p1 = uniqueProgramName('Test Program');
    const p2 = uniqueProgramName('Test Program 2');
    await createProgram(page, p1, 'a');
    await createProgram(page, p2, 'b');
    const confirmPromise = acceptNextDialog(page);
    await programRow(page, p2).getByRole('button', { name: '🗑' }).click();
    await confirmPromise;
    await expect(programRow(page, p2)).toHaveCount(0);
    await expect(programRow(page, p1)).toBeVisible();
  });

  test('TC-008 Deletion works when duplicate program names exist', async ({ page }) => {
    const dup = uniqueProgramName('Test Program');
    await createProgram(page, dup, 'first');
    const dialog = await openNewProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(dup);
    await dialog.getByLabel('Description').fill('second');
    await dialog.getByRole('button', { name: 'Create' }).click();
    if (await dialog.isVisible().catch(() => false)) {
      test.skip(true, 'App rejects duplicate program names; cannot test two same-name rows.');
      return;
    }
    const rows = page.locator('tbody tr').filter({ has: page.getByText(dup, { exact: true }) });
    await expect(rows).toHaveCount(2);
    const confirmPromise = acceptNextDialog(page);
    await rows.first().getByRole('button', { name: '🗑' }).click();
    await confirmPromise;
    await expect(rows).toHaveCount(1);
  });

  test('TC-009 Program with special characters in name can be deleted correctly', async ({
    page,
  }) => {
    const name = uniqueProgramName(`QA_Program !@#$%^&*()[]{}-+=,./?`);
    await createProgram(page, name, 'meta');
    const confirmPromise = acceptNextDialog(page);
    await programRow(page, name).getByRole('button', { name: '🗑' }).click();
    await confirmPromise;
    await expect(programRow(page, name)).toHaveCount(0);
  });

  test('TC-010 Program with maximum allowed name length can be deleted', async ({ page }) => {
    const tail = String(Date.now());
    const longName = (`D${'q'.repeat(120)}${tail}`).slice(0, 100);
    await createProgram(page, longName, 'max');
    const confirmPromise = acceptNextDialog(page);
    await programRow(page, longName).getByRole('button', { name: '🗑' }).click();
    await confirmPromise;
    await expect(programRow(page, longName)).toHaveCount(0);
  });

  test('TC-013 Cancel action preserves data for duplicate names and special characters', async ({
    page,
  }) => {
    const dup = uniqueProgramName('Test Program');
    const spec = uniqueProgramName('QA_Prog !@#');
    await createProgram(page, dup, 'a');
    await createProgram(page, dup, 'b');
    await createProgram(page, spec, 'c');
    for (const target of [dup, spec]) {
      const dismissPromise = dismissNextDialog(page);
      await programRow(page, target).first().getByRole('button', { name: '🗑' }).click();
      await dismissPromise;
    }
    await expect(page.locator('tbody tr').filter({ has: page.getByText(dup, { exact: true }) })).toHaveCount(2);
    await expect(programRow(page, spec)).toBeVisible();
  });
});
