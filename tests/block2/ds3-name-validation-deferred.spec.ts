import { test } from '@playwright/test';

/**
 * DS-3 (block2/DS-3/block2_output.md) assumes additional required fields on Create Program:
 * Program Code, Academic Year, Department.
 *
 * Didaxis Studio’s current form only exposes Program Name and Description (see DS-1 tests).
 * Overlapping scenarios (trim, duplicates, whitespace, max length) are covered in
 * `ds1-create-program.spec.ts`. Re-enable this file when the product matches DS-3’s form model.
 */
test.describe.skip('Block 2 — DS-3 Program name validation (deferred — form model mismatch)', () => {
  test('Placeholder — implement when Program Code / Academic Year / Department exist', () => {});
});
