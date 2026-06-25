import { type Locator, type Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation';

export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

/**
 * Settings screen at `/settings`. Sections: Calendar View (visible days/hours),
 * Account (profile + change password), Users (table + Add User), and API
 * Tokens (table + Create Token).
 */
export class SettingsPage {
  readonly nav: AppNavigation;
  readonly heading: Locator;
  readonly visibleHoursFrom: Locator;
  readonly visibleHoursTo: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly updatePasswordButton: Locator;
  readonly usersTable: Locator;
  readonly addUserButton: Locator;
  readonly createTokenButton: Locator;

  constructor(private readonly page: Page) {
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole('heading', { name: 'Settings', level: 2 });
    this.visibleHoursFrom = page.getByRole('textbox', { name: 'From' });
    this.visibleHoursTo = page.getByRole('textbox', { name: 'To' });
    this.currentPasswordInput = page.getByLabel('Current Password');
    this.newPasswordInput = page.getByLabel('New Password');
    this.updatePasswordButton = page.getByRole('button', { name: 'Update Password' });
    this.usersTable = page.getByRole('table').filter({ has: page.getByText('Email') });
    this.addUserButton = page.getByRole('button', { name: 'Add User' });
    this.createTokenButton = page.getByRole('button', { name: 'Create Token' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
  }

  visibleDayCheckbox(day: WeekDay): Locator {
    return this.page.getByRole('checkbox', { name: day });
  }

  userRow(email: string): Locator {
    return this.usersTable
      .locator('tbody tr')
      .filter({ has: this.page.getByText(email, { exact: true }) })
      .first();
  }
}
