import { type Locator, type Page } from '@playwright/test';

export type ProgramDialogName = 'New Program' | 'Edit Program';

export interface ProgramAiConfig {
  totalProgramHours?: string;
  targetAudience?: string;
  focusAreas?: string;
}

/**
 * Shared mechanics for the New/Edit Program dialogs. The two dialogs are
 * identical except for their accessible name and primary submit button
 * (Create vs Save), which the concrete subclasses add.
 *
 * All locators are scoped to the dialog so they never collide with the page
 * behind it. No assertions live here — waits use `Locator.waitFor`.
 */
export abstract class ProgramModal {
  readonly dialog: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly toggleAiConfigButton: Locator;
  readonly totalProgramHoursInput: Locator;
  readonly targetAudienceInput: Locator;
  readonly focusAreasInput: Locator;
  readonly syncAsyncSlider: Locator;

  constructor(
    protected readonly page: Page,
    dialogName: ProgramDialogName,
  ) {
    this.dialog = page.getByRole('dialog', { name: dialogName });
    this.programNameInput = this.dialog.getByLabel('Program Name');
    this.descriptionInput = this.dialog.getByLabel('Description');
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
    this.toggleAiConfigButton = this.dialog.getByRole('button', {
      name: /(Show|Hide) AI Generation Config/,
    });
    this.totalProgramHoursInput = this.dialog.getByPlaceholder('e.g. 900');
    this.targetAudienceInput = this.dialog.getByPlaceholder(
      'e.g. Career changers, no CS background',
    );
    this.focusAreasInput = this.dialog.getByPlaceholder(
      'e.g. Python, SQL, Machine Learning, Data Visualization',
    );
    this.syncAsyncSlider = this.dialog.getByRole('slider');
  }

  async fillName(name: string): Promise<void> {
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async expandAiConfig(): Promise<void> {
    await this.toggleAiConfigButton.click();
  }

  async fillAiConfig(config: ProgramAiConfig): Promise<void> {
    if (config.totalProgramHours !== undefined) {
      await this.totalProgramHoursInput.fill(config.totalProgramHours);
    }
    if (config.targetAudience !== undefined) {
      await this.targetAudienceInput.fill(config.targetAudience);
    }
    if (config.focusAreas !== undefined) {
      await this.focusAreasInput.fill(config.focusAreas);
    }
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  /** Wait (not assert) for the dialog to disappear after a successful action. */
  async waitUntilHidden(timeout = 20_000): Promise<void> {
    await this.dialog.waitFor({ state: 'hidden', timeout });
  }
}
