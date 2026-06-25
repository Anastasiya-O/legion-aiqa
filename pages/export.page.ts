import { type Locator, type Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation';

export type ExportFormat = 'JSON' | 'CSV' | 'PDF' | 'Excel';

/**
 * Export screen at `/export`. Step 1: choose a Program + Semester. Step 2:
 * choose a format (JSON / CSV / PDF / Excel). Then click Export.
 */
export class ExportPage {
  readonly nav: AppNavigation;
  readonly heading: Locator;
  readonly programSelect: Locator;
  readonly semesterSelect: Locator;
  readonly exportButton: Locator;

  constructor(private readonly page: Page) {
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole('heading', { name: 'Export Schedule', level: 2 });
    this.programSelect = page.getByRole('textbox', { name: 'Program' });
    this.semesterSelect = page.getByRole('textbox', { name: 'Semester' });
    this.exportButton = page.getByRole('button', { name: 'Export', exact: true });
  }

  /** Format card (JSON, CSV, PDF, Excel) selectable in Step 2. */
  formatCard(format: ExportFormat): Locator {
    return this.page.getByText(format, { exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/export');
  }

  async selectFormat(format: ExportFormat): Promise<void> {
    await this.formatCard(format).click();
  }
}
