import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { trackProgram } from '../../fixtures/cleanup.fixture';

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

function isProgramCreateResponse(response: Response): boolean {
  return (
    response.url().includes('/api/programs') &&
    response.request().method() === 'POST' &&
    response.ok()
  );
}

export async function uuidFromProgramCreateResponse(response: Response): Promise<string> {
  const body = (await response.json()) as {
    id?: string;
    uuid?: string;
    data?: { id?: string; uuid?: string };
  };
  const uuid = body.id ?? body.uuid ?? body.data?.id ?? body.data?.uuid;
  if (!uuid) {
    throw new Error('Create program response did not include id/uuid');
  }
  return uuid;
}

export function waitForProgramCreate(page: Page) {
  return page.waitForResponse(isProgramCreateResponse);
}

export async function clickCreateInDialog(page: Page, dialog: Locator): Promise<string> {
  const createResponse = waitForProgramCreate(page);
  await dialog.getByRole('button', { name: 'Create' }).click();
  const response = await createResponse;
  await expect(dialog).toBeHidden({ timeout: 20_000 });
  return uuidFromProgramCreateResponse(response);
}

export async function createProgram(page: Page, name: string, description = ''): Promise<string> {
  const dialog = await openNewProgramDialog(page);
  await dialog.getByLabel('Program Name').fill(name);
  if (description.length > 0) {
    await dialog.getByLabel('Description').fill(description);
  }
  return clickCreateInDialog(page, dialog);
}

export async function createAndTrackProgram(
  page: Page,
  name: string,
  description = '',
): Promise<string> {
  const uuid = await createProgram(page, name, description);
  trackProgram(uuid);
  return uuid;
}

/** Row edit button. Accessible name is "Edit <program name>"; anchor on "Edit " so
 * program names containing "Edit" (e.g. SpecEdit) don't match the Delete button. */
export function editButton(row: Locator) {
  return row.getByRole('button', { name: /^Edit / });
}

/** Row delete button. Accessible name is "Delete <program name>". */
export function deleteButton(row: Locator) {
  return row.getByRole('button', { name: /^Delete / });
}

export async function openEditProgramDialog(page: Page, programName: string) {
  await page.goto('/programs');
  await editButton(programRow(page, programName)).click();
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
