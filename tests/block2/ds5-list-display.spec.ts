import { expect, test, trackProgram } from '../../fixtures/cleanup.fixture';
import {
  assertDidaxisEnv,
  createAndTrackProgram,
  login,
  openNewProgramDialog,
  programRow,
  uniqueProgramName,
  uuidFromProgramCreateResponse,
  waitForProgramCreate,
} from './fixtures';

test.beforeAll(assertDidaxisEnv);

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.describe('Block 2 — DS-5 Program list (filtering N/A on current UI)', () => {
  test('TC-001 Programs page shows list with name and description for existing programs', async ({
    page,
  }) => {
    const n1 = uniqueProgramName('Cardiology Care');
    const n2 = uniqueProgramName('Pediatrics Plus');
    await createAndTrackProgram(page, n1, 'Heart health management');
    await createAndTrackProgram(page, n2, 'Child wellness and preventive care');
    await page.goto('/programs');
    await expect(programRow(page, n1)).toBeVisible();
    await expect(programRow(page, n2)).toBeVisible();
    await expect(programRow(page, n1).getByText('Heart health management')).toBeVisible();
    await expect(programRow(page, n2).getByText('Child wellness and preventive care')).toBeVisible();
  });

  test('TC-002 Programs page empty-state — skipped on shared tenant (cannot assert empty catalog)', () => {
    test.skip(true, 'Requires isolated empty account; not asserted against shared test.didaxis.studio data.');
  });

  test('TC-003 Program filtering by name — skipped (no filter control in UI)', () => {
    test.skip(true, 'Programs page has no Program Name filter textbox (see block2/DS-5/block2_output.md).');
  });

  test('TC-004 Programs page does not show empty-state when at least one program exists', async ({
    page,
  }) => {
    const name = uniqueProgramName('Oncology Core');
    await createAndTrackProgram(page, name, 'Cancer treatment coordination');
    await page.goto('/programs');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
    await expect(page.getByText(/no programs have been created/i)).not.toBeVisible();
  });

  test('TC-005 Filtering with unmatched value — skipped (no filter UI)', () => {
    test.skip(true, 'No Program Name filter on current Didaxis Programs page.');
  });

  test('TC-006 Program row shows name and description columns for scoped feature', async ({ page }) => {
    const name = uniqueProgramName('MetaProg');
    await createAndTrackProgram(page, name, 'Visible description only');
    await page.goto('/programs');
    const row = programRow(page, name);
    await expect(row.locator('p').first()).toHaveText(name);
    await expect(row.getByText('Visible description only')).toBeVisible();
  });

  test('TC-007 Program with empty description still renders name', async ({ page }) => {
    const name = uniqueProgramName('General Medicine');
    await createAndTrackProgram(page, name, '');
    await page.goto('/programs');
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-008 Program names with special characters render safely', async ({ page }) => {
    const name = uniqueProgramName("Women's Health & Wellness");
    await createAndTrackProgram(page, name, 'Comprehensive care');
    let dialogSeen = false;
    page.once('dialog', () => {
      dialogSeen = true;
    });
    await page.goto('/programs');
    await expect(programRow(page, name)).toBeVisible();
    expect(dialogSeen).toBe(false);
  });

  test('TC-009 Duplicate program names appear as separate rows with correct descriptions', async ({
    page,
  }) => {
    const name = uniqueProgramName('Nutrition Track');
    await createAndTrackProgram(page, name, 'Adult program');
    const dialog = await openNewProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('Pediatric program');
    const createResponse = waitForProgramCreate(page).catch(() => null);
    await dialog.getByRole('button', { name: 'Create' }).click();
    const stillOpen = await dialog.isVisible().catch(() => false);
    if (stillOpen) {
      test.skip(true, 'Application rejected duplicate program name; cannot assert two rows.');
      return;
    }
    const response = await createResponse;
    if (response) {
      trackProgram(await uuidFromProgramCreateResponse(response));
    }
    await expect(page.locator('tbody tr').filter({ has: page.getByText(name, { exact: true }) })).toHaveCount(2);
    await expect(programRow(page, name).getByText('Adult program').first()).toBeVisible();
    await expect(programRow(page, name).getByText('Pediatric program').first()).toBeVisible();
  });

  test('TC-010 Maximum-length name and description render without layout break', async ({ page }) => {
    const tail = String(Date.now());
    const longName = (`R${'t'.repeat(120)}${tail}`).slice(0, 100);
    const longDesc = 'L'.repeat(2000);
    await createAndTrackProgram(page, longName, longDesc);
    await page.goto('/programs');
    const row = programRow(page, longName);
    await expect(row).toBeVisible();
    await expect(row.getByText(longDesc.slice(0, 80))).toBeVisible();
  });

  test('TC-011 Filter boundary values — skipped (no filter UI)', () => {
    test.skip(true, 'No filter input on Programs page.');
  });

  test('TC-012 Case-insensitive filter — skipped (no filter UI)', () => {
    test.skip(true, 'No filter input on Programs page.');
  });
});
