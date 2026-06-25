import { type Locator, type Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation';

/**
 * Validation screen at `/validation`. Pick a Program then a Semester, then run
 * "Re-validate" to check the schedule for conflicts and constraint violations.
 */
export class ValidationPage {
  readonly nav: AppNavigation;
  readonly heading: Locator;
  readonly programSelect: Locator;
  readonly semesterSelect: Locator;
  readonly revalidateButton: Locator;
  readonly emptyState: Locator;

  constructor(private readonly page: Page) {
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole('heading', { name: 'Validation', level: 2 });
    this.programSelect = page.getByRole('textbox', { name: 'Program' });
    this.semesterSelect = page.getByRole('textbox', { name: 'Semester' });
    this.revalidateButton = page.getByRole('button', { name: 'Re-validate' });
    this.emptyState = page.getByText('No semester selected');
  }

  async goto(): Promise<void> {
    await this.page.goto('/validation');
  }
}
