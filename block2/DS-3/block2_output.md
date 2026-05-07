## Test Plan: Program Name Validation and Duplicate Prevention

### Scope
Validate behavior of the `Program Name` field on the program creation form, with focus on:
- trimming/empty handling
- special character acceptance
- duplicate prevention
- boundary and negative behaviors

### Assumptions
- Form contains `Program Name` and a `Create` button.
- Duplicate check applies to `Program Name`.
- Existing program data can be seeded for tests.
- Other required fields can be filled with valid data (`Program Code`, `Academic Year`, `Department`).

---

## Positive Flows

### TC-001
- **Title:** Program is created when name contains valid letters, spaces, and special characters
- **Preconditions:** User is on Create Program form.
- **Steps:**
  1. Enter `Informatique & IA - Niveau 2` in `Program Name`.
  2. Enter `INF-IA-02` in `Program Code`.
  3. Select `2026` in `Academic Year`.
  4. Select `Computer Science` in `Department`.
  5. Click `Create`.
- **Expected result:** Program is created successfully; user sees success feedback and new program record.
- **Priority:** High

### TC-002
- **Title:** Program is created when name has leading/trailing spaces around valid text (trimmed)
- **Preconditions:** User is on Create Program form.
- **Steps:**
  1. Enter `  Data Science Fundamentals  ` in `Program Name`.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Program is created; stored/displayed name is trimmed to `Data Science Fundamentals`.
- **Priority:** Medium

### TC-003
- **Title:** Program is created when name includes accented and Unicode letters
- **Preconditions:** User is on Create Program form.
- **Steps:**
  1. Enter `Ingénierie Logicielle – Été 2026` in `Program Name`.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Program is created successfully without character corruption.
- **Priority:** Medium

---

## Negative Flows

### TC-004
- **Title:** Form submission is blocked when program name contains only spaces
- **Preconditions:** User is on Create Program form.
- **Steps:**
  1. Enter `   ` in `Program Name`.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Form is not submitted; validation error for empty/required program name is shown.
- **Priority:** High

### TC-005
- **Title:** Form submission is blocked when program name is empty
- **Preconditions:** User is on Create Program form.
- **Steps:**
  1. Leave `Program Name` blank.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Form is not submitted; required-field error is shown.
- **Priority:** High

### TC-006
- **Title:** Duplicate program name is rejected when exact same name already exists
- **Preconditions:** Program `Web Development 2026` exists.
- **Steps:**
  1. Open Create Program form.
  2. Enter `Web Development 2026` in `Program Name`.
  3. Fill all other required fields with valid values.
  4. Click `Create`.
- **Expected result:** Program is not created; duplicate-name error is displayed.
- **Priority:** High

### TC-007
- **Title:** Duplicate program name is rejected when only leading/trailing spaces differ
- **Preconditions:** Program `Web Development 2026` exists.
- **Steps:**
  1. Enter `  Web Development 2026  ` in `Program Name`.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Program is not created; duplicate-name error is displayed (after trim normalization).
- **Priority:** High

### TC-008
- **Title:** Duplicate program name is rejected when case differs only
- **Preconditions:** Program `Web Development 2026` exists.
- **Steps:**
  1. Enter `web development 2026` in `Program Name`.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Program is not created if duplicate logic is case-insensitive; clear duplicate error shown.
- **Priority:** High

---

## Edge Cases

### TC-009
- **Title:** Program name at maximum allowed length is accepted
- **Preconditions:** Max length known/configured (example: 255 chars).
- **Steps:**
  1. Enter a program name exactly at max length (e.g., 255 characters).
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Program is created successfully.
- **Priority:** Medium

### TC-010
- **Title:** Program name exceeding maximum length is rejected
- **Preconditions:** Max length known/configured (example: 255 chars).
- **Steps:**
  1. Enter a program name one character above max length (e.g., 256 characters).
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Form is not submitted or input is blocked per UX rules; user sees max-length validation.
- **Priority:** Medium

### TC-011
- **Title:** Name containing only tabs/newlines is treated as empty and rejected
- **Preconditions:** User is on Create Program form.
- **Steps:**
  1. Paste `\t\t` (tabs) or line breaks into `Program Name`.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Form is not submitted; value is trimmed/normalized as empty.
- **Priority:** Medium

### TC-012
- **Title:** Name with internal multiple spaces is preserved and accepted
- **Preconditions:** User is on Create Program form.
- **Steps:**
  1. Enter `Web   Development   2026` in `Program Name`.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Program is created successfully (unless product explicitly collapses internal spaces).
- **Priority:** Low

### TC-013
- **Title:** Name with punctuation-heavy special characters is accepted when non-empty
- **Preconditions:** User is on Create Program form.
- **Steps:**
  1. Enter `AI/ML: Foundations (Level-2) + Lab` in `Program Name`.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:** Program is created successfully; characters stored correctly.
- **Priority:** Medium

### TC-014
- **Title:** Duplicate prevention remains effective under near-simultaneous submissions
- **Preconditions:** Program `Cybersecurity 2026` does not yet exist; two sessions/users available.
- **Steps:**
  1. In Session A, enter `Cybersecurity 2026` with valid required fields.
  2. In Session B, enter `Cybersecurity 2026` with valid required fields.
  3. Submit both forms nearly simultaneously.
- **Expected result:** Only one program is created; second submission receives duplicate error.
- **Priority:** High

---

## Additional Negative Assertions (What should NOT happen)
- System should **not** create a program when `Program Name` is whitespace-only.
- System should **not** allow silent duplicate creation.
- System should **not** strip valid special characters from accepted names.
- System should **not** save untrimmed leading/trailing spaces as persisted value.
- System should **not** return a generic failure when duplicate-specific error can be shown.

---

## Ambiguities / Gaps in ACs
- Duplicate rule is not explicit on **case sensitivity** (`Web Development 2026` vs `web development 2026`).
- No defined behavior for **internal spacing normalization** (`Web  Development 2026`).
- **Maximum length** for `Program Name` is not specified.
- Allowed/disallowed **character set** is unclear (emoji, quotes, slashes, non-Latin scripts).
- Validation timing is unclear: on blur, on submit, or both.
- Error message requirements are not specified (exact text, placement, localization).
- No explicit requirement on whether trimmed value is what gets persisted/displayed.
- Concurrency behavior for duplicates is not stated (client check only vs server-enforced uniqueness).
