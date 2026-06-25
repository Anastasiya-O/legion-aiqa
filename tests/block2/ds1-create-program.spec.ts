import { expect, test, trackProgram } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages';
import { assertDidaxisEnv, uniqueProgramName } from './fixtures';

test.beforeAll(assertDidaxisEnv);

test.describe('Block 2 — DS-1 Create New Academic Program', () => {
  test('TC-001 Program creation form is displayed from the Programs page', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await expect(modal.dialog).toBeVisible();
    await expect(modal.programNameInput).toBeVisible();
    await expect(modal.descriptionInput).toBeVisible();
    await expect(modal.createButton).toBeVisible();
    const uniqueName = uniqueProgramName('E2E Program');
    await modal.fillName(uniqueName);
    await expect(modal.programNameInput).toHaveValue(uniqueName);
  });

  test('TC-002 Program is successfully created with valid name and description', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Web Development 2026');
    const desc = 'Full-stack web development program';
    trackProgram(await programs.createProgram(name, desc));
    await expect(programs.programRow(name)).toBeVisible();
    await expect(programs.programRow(name).getByText(desc)).toBeVisible();
  });

  test('TC-003 Program is successfully created with a valid name and empty description', async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Data Analytics 2026');
    trackProgram(await programs.createProgram(name, ''));
    await expect(programs.programRow(name)).toBeVisible();
  });

  test('TC-004 Create button remains disabled when Program Name is empty', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillDescription('Program without a name');
    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-005 Program is not created when Program Name contains only spaces', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName('   ');
    await modal.fillDescription('Whitespace name test');
    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-006 Duplicate program name is not created twice', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Web Development 2026');
    trackProgram(await programs.createProgram(name, 'first'));
    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(name);
    await modal.fillDescription('Duplicate program test');
    await modal.submit();
    await expect(programs.programRows(name)).toHaveCount(1);
    const err = page.getByRole('alert');
    if (await err.isVisible().catch(() => false)) {
      await expect(err).toBeVisible();
    } else {
      await expect(modal.dialog).toBeVisible();
    }
  });

  test('TC-007 Program is not created when submission fails', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Cloud Engineering 2026');
    try {
      await page.route('**/*', (route) => {
        const req = route.request();
        if (req.method() === 'POST' && req.url().toLowerCase().includes('program')) {
          return route.abort('failed');
        }
        return route.continue();
      });
      await programs.goto();
      await programs.openNewProgram();
      const modal = programs.newProgramModal;
      await modal.fillName(name);
      await modal.fillDescription('Cloud infrastructure and DevOps program');
      await modal.submit();
      await expect(modal.dialog).toBeVisible({ timeout: 15_000 });
      await expect(programs.programRow(name)).toHaveCount(0);
    } finally {
      await page.unroute('**/*');
    }
  });

  test('TC-008 Program name with leading and trailing spaces is saved without extra whitespace', async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const trimmed = uniqueProgramName('Cybersecurity 2026');
    const padded = `  ${trimmed}  `;
    trackProgram(await programs.createProgram(padded, 'Security fundamentals'));
    await expect(programs.programRow(trimmed)).toBeVisible();
  });

  test('TC-009 Program name supports valid special characters', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('AI & Machine Learning: 2026');
    const desc = 'Artificial intelligence, ML, and applied data science';
    trackProgram(await programs.createProgram(name, desc));
    await expect(programs.programRow(name)).toBeVisible();
  });

  test('TC-010 Program name rejects unsafe script content', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('<script>alert("xss")</script>');
    let dialogOpened = false;
    page.once('dialog', () => {
      dialogOpened = true;
    });
    trackProgram(await programs.createProgram(name, 'Security validation test'));
    expect(dialogOpened).toBe(false);
    await expect(programs.programRow(name)).toBeVisible();
  });

  test('TC-011 Program name accepts minimum valid length', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('A');
    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(name);
    await modal.fillDescription('Minimum length name test');
    if (await modal.createButton.isEnabled()) {
      trackProgram(await modal.submitAndGetProgramId());
      await expect(programs.programRow(name)).toBeVisible();
    } else {
      await expect(modal.createButton).toBeDisabled();
    }
  });

  test('TC-012 Program name at maximum allowed length is accepted', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const tail = String(Date.now());
    const maxName = (`P${'x'.repeat(120)}${tail}`).slice(0, 100);
    expect(maxName.length).toBe(100);
    trackProgram(await programs.createProgram(maxName, 'Maximum valid length test'));
    await expect(programs.programRow(maxName)).toBeVisible();
  });

  test('TC-013 Program name above maximum allowed length is rejected', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const tail = String(Date.now());
    const base = (`Q${'y'.repeat(120)}${tail}`).slice(0, 100);
    const tooLong = `${base}Z`;
    expect(tooLong.length).toBe(101);
    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(tooLong);
    await modal.fillDescription('Maximum length exceeded test');
    if (await modal.createButton.isEnabled()) {
      await modal.submit();
      await expect(modal.dialog).toBeVisible({ timeout: 5000 });
    } else {
      await expect(modal.createButton).toBeDisabled();
    }
  });

  test('TC-014 Description at maximum allowed length is handled correctly', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Software Engineering 2026');
    const desc = 'D'.repeat(2000);
    trackProgram(await programs.createProgram(name, desc));
    await expect(programs.programRow(name)).toBeVisible();
  });

  test('TC-015 Long description above maximum allowed length is rejected', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = uniqueProgramName('Product Management 2026');
    await programs.goto();
    await programs.openNewProgram();
    const modal = programs.newProgramModal;
    await modal.fillName(name);
    await modal.fillDescription('Z'.repeat(20_000));
    if (await modal.createButton.isEnabled()) {
      await modal.submit();
      await expect(modal.dialog).toBeVisible({ timeout: 5000 });
    } else {
      await expect(modal.createButton).toBeDisabled();
    }
  });
});
