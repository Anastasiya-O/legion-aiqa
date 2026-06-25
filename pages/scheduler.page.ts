import { type Locator, type Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation';

/**
 * Auto Scheduler screen at `/scheduler`. Pick a Program then a Semester to
 * generate a deterministic session schedule from course session plans.
 */
export class SchedulerPage {
  readonly nav: AppNavigation;
  readonly heading: Locator;
  readonly programSelect: Locator;
  readonly semesterSelect: Locator;
  readonly emptyState: Locator;

  constructor(private readonly page: Page) {
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole('heading', { name: 'Auto Scheduler', level: 2 });
    this.programSelect = page.getByRole('textbox', { name: 'Program' });
    this.semesterSelect = page.getByRole('textbox', { name: 'Semester' });
    this.emptyState = page.getByText('Select a program and semester to begin');
  }

  async goto(): Promise<void> {
    await this.page.goto('/scheduler');
  }
}
