import { type Locator, type Page, type Response } from '@playwright/test';
import { ProgramModal } from './program-modal';

/** True for the successful POST that creates a program. */
export function isProgramCreateResponse(response: Response): boolean {
  return (
    response.url().includes('/api/programs') &&
    response.request().method() === 'POST' &&
    response.ok()
  );
}

/** Extract the new program's id/uuid from a create response body. */
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

/**
 * "New Program" dialog opened from the Programs page.
 *
 * The submit button is named exactly "Create" (use `exact: true` so it never
 * matches the empty-state "Create Program" CTA on the page behind it).
 */
export class NewProgramModal extends ProgramModal {
  readonly createButton: Locator;

  constructor(page: Page) {
    super(page, 'New Program');
    this.createButton = this.dialog.getByRole('button', { name: 'Create', exact: true });
  }

  async submit(): Promise<void> {
    await this.createButton.click();
  }

  /**
   * Submit, wait for the successful create response and for the dialog to
   * close, then return the new program's id/uuid (for cleanup tracking).
   * Use only when the submission is expected to succeed.
   */
  async submitAndGetProgramId(): Promise<string> {
    const createResponse = this.page.waitForResponse(isProgramCreateResponse);
    await this.createButton.click();
    const response = await createResponse;
    await this.waitUntilHidden();
    return uuidFromProgramCreateResponse(response);
  }
}
