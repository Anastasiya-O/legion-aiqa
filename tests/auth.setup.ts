import path from 'node:path';
import { test as setup } from '@playwright/test';
import { assertDidaxisEnv, login } from './block2/fixtures';

export const STORAGE_STATE = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  assertDidaxisEnv();
  await login(page);
  await page.context().storageState({ path: STORAGE_STATE });
});
