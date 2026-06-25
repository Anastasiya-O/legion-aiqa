import { type Locator, type Page } from '@playwright/test';

/**
 * Shared sidebar navigation + user menu present on every authenticated route.
 * Compose this inside page objects (e.g. `ProgramsPage`) rather than
 * duplicating nav locators per page. No assertions live here.
 */
export class AppNavigation {
  readonly root: Locator;
  readonly dashboard: Locator;
  readonly programs: Locator;
  readonly calendar: Locator;
  readonly validation: Locator;
  readonly scheduler: Locator;
  readonly export: Locator;
  readonly settings: Locator;
  readonly signOutButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('navigation');
    this.dashboard = this.root.getByRole('button', { name: '📊 Dashboard' });
    this.programs = this.root.getByRole('button', { name: '🎓 Programs' });
    this.calendar = this.root.getByRole('button', { name: '📅 Calendar' });
    this.validation = this.root.getByRole('button', { name: '✅ Validation' });
    this.scheduler = this.root.getByRole('button', { name: '⚡ Scheduler' });
    this.export = this.root.getByRole('button', { name: '📤 Export' });
    this.settings = this.root.getByRole('button', { name: '⚙️ Settings' });
    this.signOutButton = this.root.getByRole('button', { name: 'Sign out' });
  }

  async gotoDashboard(): Promise<void> {
    await this.dashboard.click();
  }

  async gotoPrograms(): Promise<void> {
    await this.programs.click();
  }

  async gotoCalendar(): Promise<void> {
    await this.calendar.click();
  }

  async gotoValidation(): Promise<void> {
    await this.validation.click();
  }

  async gotoScheduler(): Promise<void> {
    await this.scheduler.click();
  }

  async gotoExport(): Promise<void> {
    await this.export.click();
  }

  async gotoSettings(): Promise<void> {
    await this.settings.click();
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }
}
