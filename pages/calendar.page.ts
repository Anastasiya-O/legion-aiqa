import { type Locator, type Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation';

/**
 * Calendar screen at `/calendar`. Requires a Program then a Semester selection
 * (autocomplete textboxes) before the calendar renders; the Semester field is
 * disabled until a program is chosen.
 */
export class CalendarPage {
  readonly nav: AppNavigation;
  readonly heading: Locator;
  readonly programSelect: Locator;
  readonly semesterSelect: Locator;
  readonly emptyState: Locator;

  constructor(private readonly page: Page) {
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole('heading', { name: 'Calendar', level: 2 });
    this.programSelect = page.getByRole('textbox', { name: 'Program' });
    this.semesterSelect = page.getByRole('textbox', { name: 'Semester' });
    this.emptyState = page.getByText('Select a program and semester to view the calendar');
  }

  async goto(): Promise<void> {
    await this.page.goto('/calendar');
  }
}
