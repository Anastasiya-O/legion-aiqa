## Delete Program With Confirmation — Test Plan

### Scope
Validate deletion behavior for programs from the program list, including confirmation modal behavior, cancellation, and robustness across edge conditions.

### Assumptions
- Program list displays program names in a table/list view.
- Each row has a delete icon (trash icon).
- Confirmation dialog has `Confirm` and `Cancel` buttons.
- Program name example used in AC: `Test Program`.
- Deletion is persistent (not soft delete) unless otherwise specified.

---

## Positive Flows

### TC-001
- **Title:** Program is removed after deletion is confirmed
- **Preconditions:**  
  - Program list contains `Test Program` (unique name, single instance).
- **Steps:**  
  1. Navigate to the Program List page.  
  2. Locate row with program name `Test Program`.  
  3. Click the delete icon for `Test Program`.  
  4. Verify confirmation dialog appears.  
  5. Click `Confirm`.
- **Expected Result:**  
  - Confirmation dialog closes.  
  - `Test Program` no longer appears in the program list.  
  - No unrelated program rows are removed.
- **Priority:** High

### TC-002
- **Title:** Program remains when deletion is canceled from confirmation dialog
- **Preconditions:**  
  - Program list contains `Test Program`.
- **Steps:**  
  1. Navigate to Program List page.  
  2. Click delete icon for `Test Program`.  
  3. Verify confirmation dialog appears.  
  4. Click `Cancel`.
- **Expected Result:**  
  - Confirmation dialog closes.  
  - `Test Program` remains visible in the list unchanged.
- **Priority:** High

### TC-003
- **Title:** Confirmation dialog content reflects the selected program
- **Preconditions:**  
  - Program list contains `Test Program` and `Alpha Program`.
- **Steps:**  
  1. Click delete icon for `Test Program`.  
  2. Observe dialog text.
- **Expected Result:**  
  - Dialog clearly indicates delete confirmation for `Test Program` (not another program).  
  - `Confirm` and `Cancel` controls are visible and enabled.
- **Priority:** Medium

---

## Negative Flows

### TC-004
- **Title:** Program is not deleted before explicit confirmation
- **Preconditions:**  
  - Program list contains `Test Program`.
- **Steps:**  
  1. Click delete icon for `Test Program`.  
  2. Do not click `Confirm`; close dialog using `X` (if available) or click outside modal (if supported).
- **Expected Result:**  
  - `Test Program` is still present.  
  - No deletion occurs without explicit `Confirm`.
- **Priority:** High

### TC-005
- **Title:** Multiple rapid clicks on Confirm do not delete additional records or crash UI
- **Preconditions:**  
  - Program list contains `Test Program`.
- **Steps:**  
  1. Open delete confirmation for `Test Program`.  
  2. Rapidly click `Confirm` 2–5 times.
- **Expected Result:**  
  - Only `Test Program` is deleted once.  
  - No error toast, duplicate requests side effects, or UI freeze.
- **Priority:** Medium

### TC-006
- **Title:** Deletion failure does not remove program from list
- **Preconditions:**  
  - Program list contains `Test Program`.  
  - Backend error can be simulated (e.g., API returns 500/403/network timeout).
- **Steps:**  
  1. Click delete icon for `Test Program`.  
  2. Click `Confirm` while API failure condition is active.
- **Expected Result:**  
  - User receives an error message.  
  - `Test Program` remains in the list.  
  - Dialog behavior aligns with UX spec (stays open or closes with error notification), but data is not deleted.
- **Priority:** High

### TC-007
- **Title:** Wrong program must not be deleted when confirmation is opened from another row
- **Preconditions:**  
  - Program list contains `Test Program` and `Test Program 2`.
- **Steps:**  
  1. Click delete icon for `Test Program 2`.  
  2. Click `Confirm`.
- **Expected Result:**  
  - `Test Program 2` is removed.  
  - `Test Program` remains.
- **Priority:** High

---

## Edge Cases

### TC-008
- **Title:** Deletion works when duplicate program names exist
- **Preconditions:**  
  - Program list contains two rows named `Test Program` (different internal IDs).
- **Steps:**  
  1. Identify first `Test Program` row (topmost).  
  2. Click its delete icon.  
  3. Confirm deletion.
- **Expected Result:**  
  - Only the selected `Test Program` row is removed.  
  - The other `Test Program` row remains.
- **Priority:** High

### TC-009
- **Title:** Program with special characters in name can be deleted correctly
- **Preconditions:**  
  - Program list contains `QA_Program !@#$%^&*()[]{}-+=,./?`.
- **Steps:**  
  1. Click delete icon for `QA_Program !@#$%^&*()[]{}-+=,./?`.  
  2. Confirm deletion.
- **Expected Result:**  
  - Correct row is deleted.  
  - Dialog renders name safely (no broken UI/encoding issues).
- **Priority:** Medium

### TC-010
- **Title:** Program with maximum allowed name length can be deleted
- **Preconditions:**  
  - Program list contains a program whose name length equals system max (e.g., 255 chars).
- **Steps:**  
  1. Locate max-length program row.  
  2. Click delete icon.  
  3. Confirm deletion.
- **Expected Result:**  
  - Program is successfully deleted.  
  - No truncation-related mismatch deletes the wrong row.
- **Priority:** Medium

### TC-011
- **Title:** Deletion behavior remains correct on filtered/searched list
- **Preconditions:**  
  - Program list contains `Test Program` and other entries.  
  - Search/filter feature is available.
- **Steps:**  
  1. Filter/search for `Test Program`.  
  2. Click delete icon for filtered result.  
  3. Confirm deletion.  
  4. Clear filter.
- **Expected Result:**  
  - `Test Program` is removed both in filtered view and full list.
- **Priority:** Medium

### TC-012
- **Title:** Deletion behavior remains correct with pagination boundaries
- **Preconditions:**  
  - Program list has multiple pages; `Test Program` is last row on a page.
- **Steps:**  
  1. Navigate to page containing `Test Program`.  
  2. Delete and confirm.  
  3. Observe pagination/list refresh.
- **Expected Result:**  
  - `Test Program` is removed.  
  - Pagination updates gracefully (no blank row/page errors).
- **Priority:** Low

### TC-013
- **Title:** Cancel action preserves data for duplicate names and special characters
- **Preconditions:**  
  - Program list contains `Test Program`, second `Test Program`, and `QA_Program !@#`.
- **Steps:**  
  1. Open delete confirmation for each of the above one by one.  
  2. Click `Cancel` each time.
- **Expected Result:**  
  - No program is deleted in any cancel path.
- **Priority:** Medium

---

## Coverage Mapping to AC

- **AC: Delete program with confirmation** → Covered by `TC-001`, `TC-003`, `TC-007`.
- **AC: Cancel program deletion** → Covered by `TC-002`, `TC-013`.
- **Additional robustness (edge/negative)** → Covered by `TC-004` to `TC-012`.

---

## Ambiguities / Gaps in ACs

- Confirmation dialog content is not specified (should program name be shown? warning text?).
- Modal dismissal behavior is unspecified (`X` button, ESC key, click outside).
- Error-handling expectation is missing (API failure, timeout, permission denied).
- Duplicate-name behavior is not defined (which record is deleted when names match).
- No acceptance criteria for list states (filtered view, sorted view, paginated view).
- No expectation for user feedback after deletion/cancel (toast/snackbar/silent refresh).
- No non-functional requirements (latency, accessibility, keyboard support, audit logging).
- No clarification on soft delete vs hard delete and recoverability/undo behavior.
