import { expect, test, trackProgram } from '../../fixtures/cleanup.fixture';
import {
  ProgramsPage,
  isProgramCreateResponse,
  uuidFromProgramCreateResponse,
} from '../../pages';
import { assertDidaxisEnv, uniqueProgramName } from './fixtures';

/**
 * Jira DS-3: https://legionqaschool.atlassian.net/browse/DS-3
 * "Program name validation and duplicate prevention"
 *
 * Acceptance criteria (from the ticket):
 *  - AC1: A whitespace-only name is trimmed, treated as empty, and not submitted.
 *  - AC2: A name with special characters ("Informatique & IA - Niveau 2") is accepted.
 *  - AC3: A duplicate program name is rejected with an error.
 *
 * The live Didaxis form only exposes Program Name + Description, so "other
 * required fields" in the ticket reduce to those two (Description optional).
 */
test.beforeAll(assertDidaxisEnv);

/** Track the duplicate submission if the app actually persisted it (cleanup). */
async function trackIfCreated(page: import('@playwright/test').Page): Promise<void> {
  const response = await page
    .waitForResponse(isProgramCreateResponse, { timeout: 5_000 })
    .catch(() => null);
  if (response) {
    trackProgram(await uuidFromProgramCreateResponse(response));
  }
}

test.describe('Block 2 — DS-3 Program name validation & duplicate prevention', () => {
  // --- Happy paths ---

  test('TC-001 Name with special characters is accepted (AC2)', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Informatique & IA - Niveau 2');
    trackProgram(await programs.createProgram(name, 'Programme avec caractères spéciaux'));
    await expect(programs.programRow(name)).toBeVisible();
  });

  test('TC-002 Name with accented / Unicode letters is accepted', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Ingénierie Logicielle – Été 2026');
    trackProgram(await programs.createProgram(name, 'Curriculum francophone'));
    await expect(programs.programRow(name)).toBeVisible();
  });

  // --- Negative ---

  test('TC-003 Whitespace-only name is rejected (AC1)', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName('   ');
    await modal.fillDescription('Whitespace-only name should be treated as empty');
    await expect(modal.createButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test('TC-004 Empty name is rejected', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillDescription('Required-field validation for an empty name');
    await expect(modal.createButton).toBeDisabled();
    await expect(modal.dialog).toBeVisible();
  });

  test('TC-005 Exact duplicate program name is rejected (AC3)', async ({ page }) => {
    // Known demo bug: Didaxis does not enforce program-name uniqueness on create,
    // so AC3 (duplicate rejection) currently fails. Marked expected-to-fail so the
    // suite stays green while documenting the gap (see DS-2 TC-009 guardrail).
    test.fail(
      true,
      'Known demo bug — Didaxis allows duplicate program names on create; AC3 is not enforced.',
    );
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Web Development 2026');
    trackProgram(await programs.createProgram(name, 'Original program'));

    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(name);
    await modal.fillDescription('Attempted duplicate');
    await modal.submit();
    await trackIfCreated(page);

    await expect(programs.programRows(name)).toHaveCount(1);
  });

  // --- Edge cases ---

  test('TC-006 Leading/trailing spaces are trimmed on save', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const trimmed = uniqueProgramName('Data Science Fundamentals');
    const padded = `  ${trimmed}  `;
    trackProgram(await programs.createProgram(padded, 'Trim normalization test'));
    const row = programs.programRow(trimmed);
    await expect(row).toBeVisible();
    // Stored/displayed name has no leading or trailing whitespace.
    await expect(row.locator('p').first()).toHaveText(trimmed);
  });

  test('TC-007 Duplicate differing only by surrounding spaces is rejected', async ({ page }) => {
    // Known demo bug: see TC-005. Trimming works, but the trimmed duplicate is
    // still persisted instead of being rejected.
    test.fail(
      true,
      'Known demo bug — Didaxis allows duplicate program names on create; AC3 is not enforced.',
    );
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Cybersecurity 2026');
    trackProgram(await programs.createProgram(name, 'Original program'));

    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(`  ${name}  `);
    await modal.fillDescription('Duplicate after trim normalization');
    await modal.submit();
    await trackIfCreated(page);

    await expect(programs.programRows(name)).toHaveCount(1);
  });
});
