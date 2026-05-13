import { expect, type Page } from '@playwright/test';

export const DIDAXIS_EMAIL = process.env.DIDAXIS_EMAIL;
export const DIDAXIS_PASSWORD = process.env.DIDAXIS_PASSWORD;

export function assertDidaxisEnv() {
  if (!process.env.DIDAXIS_URL) {
    throw new Error('Set DIDAXIS_URL in .env (loaded via playwright.config).');
  }
  if (!DIDAXIS_EMAIL || !DIDAXIS_PASSWORD) {
    throw new Error('Set DIDAXIS_EMAIL and DIDAXIS_PASSWORD in .env.');
  }
}

export function uniqueProgramName(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

export async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
}

/** First tbody row whose program name cell contains this exact title (first paragraph). */
export function programRow(page: Page, programName: string) {
  return page
    .locator('tbody tr')
    .filter({ has: page.getByText(programName, { exact: true }) })
    .first();
}

export async function openNewProgramDialog(page: Page) {
  await page.goto('/programs');
  await page.getByRole('button', { name: '+ New Program' }).click();
  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function createProgram(page: Page, name: string, description = ''): Promise<void> {
  const dialog = await openNewProgramDialog(page);
  await dialog.getByLabel('Program Name').fill(name);
  if (description.length > 0) {
    await dialog.getByLabel('Description').fill(description);
  }
  await dialog.getByRole('button', { name: 'Create' }).click();
  await expect(dialog).toBeHidden({ timeout: 20_000 });
}

export async function openEditProgramDialog(page: Page, programName: string) {
  await page.goto('/programs');
  await programRow(page, programName).getByRole('button', { name: '✏️' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit Program' });
  await expect(dialog).toBeVisible();
  return dialog;
}

export function acceptNextDialog(page: Page): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('No window dialog appeared')), 10_000);
    page.once('dialog', (dialog) => {
      clearTimeout(timer);
      dialog
        .accept()
        .then(() => resolve())
        .catch(reject);
    });
  });
}

export function dismissNextDialog(page: Page): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('No window dialog appeared')), 10_000);
    page.once('dialog', (dialog) => {
      clearTimeout(timer);
      const msg = dialog.message();
      dialog
        .dismiss()
        .then(() => resolve(msg))
        .catch(reject);
    });
  });
}
