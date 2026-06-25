import { test as base, expect } from '@playwright/test';
import { trackProgramId } from '../support/program-tracker';

const programsByTest = new Map<string, string[]>();

export function trackProgram(uuid: string): void {
  const key = base.info().testId;
  const list = programsByTest.get(key) ?? [];
  list.push(uuid);
  programsByTest.set(key, list);
  trackProgramId(uuid);
}

export async function deleteProgram(uuid: string): Promise<void> {
  const token = process.env.DIDAXIS_API_TOKEN;
  if (!token) {
    throw new Error('Set DIDAXIS_API_TOKEN in .env (loaded via playwright.config).');
  }

  const baseUrl = (process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/api/programs/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 404) {
    const body = await response.text();
    throw new Error(`Failed to delete program ${uuid}: ${response.status} ${body}`);
  }

  if (response.ok) {
    console.log(`[api-cleanup] Deleted program ${uuid}`);
  } else if (response.status === 404) {
    console.log(`[api-cleanup] Program ${uuid} already removed (404)`);
  }
}

export const test = base;

test.afterEach(async ({}, testInfo) => {
  const uuids = programsByTest.get(testInfo.testId) ?? [];
  programsByTest.delete(testInfo.testId);

  for (const uuid of uuids) {
    await deleteProgram(uuid);
  }
});

export { expect };
