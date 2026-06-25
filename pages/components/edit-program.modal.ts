import { type Locator, type Page } from '@playwright/test';
import { ProgramModal } from './program-modal';

/**
 * "Edit Program" dialog opened from a program row's Edit action. Identical to
 * the New Program dialog except the primary button is "Save".
 */
export class EditProgramModal extends ProgramModal {
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page, 'Edit Program');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save', exact: true });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
