import { type Locator, type Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation';

/** Post-login landing screen at `/`. */
export class DashboardPage {
  readonly nav: AppNavigation;
  readonly heading: Locator;
  readonly connectionStatus: Locator;
  readonly quickStart: Locator;

  constructor(private readonly page: Page) {
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard', level: 2 });
    this.connectionStatus = page.getByText('Connected');
    this.quickStart = page.getByText('Quick Start');
  }

  /** Summary card by its title text, e.g. "Programs", "Calendar". */
  card(title: string): Locator {
    return this.page.getByText(title, { exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
