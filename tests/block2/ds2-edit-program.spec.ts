import { expect, test } from '../../fixtures/cleanup.fixture';
import {
  assertDidaxisEnv,
  createAndTrackProgram,
  openEditProgramDialog,
  programRow,
  uniqueProgramName,
} from './fixtures';

/** Confluence Program Setup — Field Definitions (Name max 100 characters). */
const MAX_PROGRAM_NAME_LENGTH = 100;

test.beforeAll(assertDidaxisEnv);

// Jira DS-2: https://legionqaschool.atlassian.net/browse/DS-2
// Test plan: block2/DS-2/block2_output.md
test.describe('Block 2 — DS-2 Program editing', () => {
  test('TC-001 Edit form shows current program data', async ({ page }) => {
    const name = uniqueProgramName('Web Development 2026');
    await createAndTrackProgram(page, name, 'Original description');
    const dialog = await openEditProgramDialog(page, name);
    await expect(page).toHaveURL(/\/programs/);
    await expect(dialog.getByLabel('Program Name')).toHaveValue(name);
    await expect(dialog.getByLabel('Description')).toHaveValue('Original description');
  });

  test('TC-002 Rename saves and updates list immediately', async ({ page }) => {
    const name = uniqueProgramName('Web Development 2026');
    await createAndTrackProgram(page, name, 'Desc');
    const dialog = await openEditProgramDialog(page, name);
    const updated = `${name} - Updated`;
    await dialog.getByLabel('Program Name').fill(updated);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(programRow(page, updated)).toBeVisible();
    await expect(programRow(page, name)).toHaveCount(0);
  });

  test('TC-003 Unchanged fields are preserved', async ({ page }) => {
    const name = uniqueProgramName('Web Development 2026');
    const originalDesc = 'Original body';
    const newDesc = 'Only description changed';
    await createAndTrackProgram(page, name, originalDesc);
    const dialog = await openEditProgramDialog(page, name);
    await dialog.getByLabel('Description').fill(newDesc);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(programRow(page, name)).toBeVisible();
    const reopen = await openEditProgramDialog(page, name);
    await expect(reopen.getByLabel('Program Name')).toHaveValue(name);
    await expect(reopen.getByLabel('Description')).toHaveValue(newDesc);
  });

  test('TC-101 Empty Name cannot be saved', async ({ page }) => {
    const name = uniqueProgramName('EmptyName');
    await createAndTrackProgram(page, name, 'x');
    const dialog = await openEditProgramDialog(page, name);
    await dialog.getByLabel('Program Name').fill('');
    const saveBtn = dialog.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeDisabled();
    await expect(dialog).toBeVisible();
    await expect(programRow(page, name)).toBeVisible();
    const err = page.getByRole('alert');
    if (await err.isVisible().catch(() => false)) {
      await expect(err).toBeVisible();
    }
  });

  test('TC-102 Save failure does not close modal', async ({ page }) => {
    const name = uniqueProgramName('SaveFail');
    const patched = `${name}-patched`;
    await createAndTrackProgram(page, name, 'x');
    const dialog = await openEditProgramDialog(page, name);
    try {
      await page.route('**/*', (route) => {
        const req = route.request();
        // Program edits are saved via PATCH /api/programs/<id> (create uses POST).
        // Abort all mutating verbs so the save genuinely fails.
        const isMutation = ['POST', 'PUT', 'PATCH'].includes(req.method());
        if (isMutation && req.url().toLowerCase().includes('program')) {
          return route.abort('failed');
        }
        return route.continue();
      });
      await dialog.getByLabel('Program Name').fill(patched);
      await dialog.getByRole('button', { name: 'Save' }).click();
      await expect(dialog).toBeVisible({ timeout: 15_000 });
      await expect(programRow(page, patched)).toHaveCount(0);
      await expect(programRow(page, name)).toBeVisible();
      const err = page.getByRole('alert');
      if (await err.isVisible().catch(() => false)) {
        await expect(err).toBeVisible();
      }
    } finally {
      await page.unroute('**/*');
    }
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-103 Duplicate program name handling is enforced', async ({ page }) => {
    const a = uniqueProgramName('ProgA');
    const b = uniqueProgramName('ProgB');
    await createAndTrackProgram(page, a, 'da');
    await createAndTrackProgram(page, b, 'db');
    const dialog = await openEditProgramDialog(page, b);
    await dialog.getByLabel('Program Name').fill(a);
    await dialog.getByRole('button', { name: 'Save' }).click();
    const stillOpen = await dialog.isVisible().catch(() => false);
    const alert = page.getByRole('alert');
    const hasAlert = await alert.isVisible().catch(() => false);
    expect(stillOpen || hasAlert).toBeTruthy();
    await expect(programRow(page, b)).toBeVisible();
    await expect(page.locator('tbody tr').filter({ has: page.getByText(a, { exact: true }) })).toHaveCount(
      1,
    );
  });

  test('TC-201 Name at max length saves', async ({ page }) => {
    const tail = String(Date.now());
    const maxName = (`E${'z'.repeat(120)}${tail}`).slice(0, MAX_PROGRAM_NAME_LENGTH);
    expect(maxName).toHaveLength(MAX_PROGRAM_NAME_LENGTH);
    const name = uniqueProgramName('MaxEdit');
    await createAndTrackProgram(page, name, 'd');
    const dialog = await openEditProgramDialog(page, name);
    await dialog.getByLabel('Program Name').fill(maxName);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(programRow(page, maxName)).toBeVisible();
    const reopen = await openEditProgramDialog(page, maxName);
    await expect(reopen.getByLabel('Program Name')).toHaveValue(maxName);
  });

  test('TC-202 Name above max length is rejected or limited', async ({ page, request }) => {
    // Known demo bug: Didaxis does not enforce the documented 100-character
    // maximum on the program name when editing. The Program Name field has no
    // maxlength and the API performs no length validation, so a 101-char name is
    // stored verbatim. Marked expected-to-fail to document the gap (TC-201
    // confirms an exactly-100 name is accepted). Verified via the API because the
    // UI does not render/match a 101-char name reliably.
    test.fail(
      true,
      'Known demo bug — Didaxis does not enforce the 100-char program name max on edit; over-length names are stored.',
    );
    const tail = String(Date.now());
    const tooLong = `${(`F${'w'.repeat(120)}${tail}`).slice(0, MAX_PROGRAM_NAME_LENGTH)}Z`;
    expect(tooLong.length).toBe(MAX_PROGRAM_NAME_LENGTH + 1);

    const name = uniqueProgramName('OverEdit');
    const uuid = await createAndTrackProgram(page, name, 'd');
    const dialog = await openEditProgramDialog(page, name);
    await dialog.getByLabel('Program Name').fill(tooLong);
    await dialog.getByRole('button', { name: 'Save' }).click();
    // Wait for the save to settle: the dialog closes when accepted, or stays open
    // if the app were to reject it. Either way, continue to the API assertion.
    await dialog.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});

    const baseUrl = (process.env.DIDAXIS_URL ?? '').replace(/\/$/, '');
    const res = await request.get(`${baseUrl}/api/programs/${uuid}`, {
      headers: { Authorization: `Bearer ${process.env.DIDAXIS_API_TOKEN}` },
    });
    const body = (await res.json()) as { data?: { name?: string } };
    const storedName = body.data?.name ?? '';
    // The stored name must respect the documented maximum length.
    expect(storedName.length).toBeLessThanOrEqual(MAX_PROGRAM_NAME_LENGTH);
  });

  test('TC-203 Special characters are preserved', async ({ page }) => {
    const name = uniqueProgramName('SpecEdit');
    await createAndTrackProgram(page, name, 'd');
    const special = uniqueProgramName('Web Development 2026 — "Beta" <cohort>');
    const dialog = await openEditProgramDialog(page, name);
    await dialog.getByLabel('Program Name').fill(special);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(programRow(page, special)).toBeVisible();
    const reopen = await openEditProgramDialog(page, special);
    await expect(reopen.getByLabel('Program Name')).toHaveValue(special);
  });

  test('TC-204 Whitespace-only or trimmed names handled consistently', async ({ page }) => {
    const core = uniqueProgramName('TrimEdit');
    await createAndTrackProgram(page, core, 'd');
    const dialog = await openEditProgramDialog(page, core);
    await dialog.getByLabel('Program Name').fill(`  ${core}  `);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(programRow(page, core)).toBeVisible();
    // The stored name must be trimmed. getByText normalizes whitespace, so it
    // can't detect surrounding spaces; reopen and assert the exact input value
    // (toHaveValue compares the raw string, no whitespace normalization).
    const reopenTrim = await openEditProgramDialog(page, core);
    await expect(reopenTrim.getByLabel('Program Name')).toHaveValue(core);
    await reopenTrim.getByRole('button', { name: 'Cancel' }).click();

    const spacesOnly = uniqueProgramName('SpacesOnly');
    await createAndTrackProgram(page, spacesOnly, 'd');
    const dialogSpaces = await openEditProgramDialog(page, spacesOnly);
    await dialogSpaces.getByLabel('Program Name').fill('   ');
    await expect(dialogSpaces.getByRole('button', { name: 'Save' })).toBeDisabled();
    await expect(dialogSpaces).toBeVisible();
    await expect(programRow(page, spacesOnly)).toBeVisible();
  });
});
