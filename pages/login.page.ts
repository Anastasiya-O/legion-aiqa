import { type Locator, type Page } from '@playwright/test';

/**
 * Login screen at `/login`. Used by setup (`tests/auth.setup.ts`) and explicit
 * unauthenticated scenarios only — authenticated specs reuse `storageState`
 * and should not call `login()`.
 */
export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  /** Fill credentials, submit, and wait (not assert) until we leave `/login`. */
  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    await this.page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 20_000,
    });
  }
}
