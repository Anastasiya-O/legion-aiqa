# Structured test plan — Program editing

## Positive flows

### TC-001 — Edit form shows current program data
- **Preconditions:** User can edit programs; `Web Development 2026` exists.
- **Steps:**
  1. Open Programs page.
  2. Click edit icon for `Web Development 2026`.
- **Expected result:** Edit form opens and is pre-populated with current values.
- **Priority:** High

### TC-002 — Rename saves and updates list immediately
- **Preconditions:** Edit form open for `Web Development 2026`.
- **Steps:**
  1. Change **Name** to `Web Development 2026 - Updated`.
  2. Click **Save**.
- **Expected result:** Modal closes and list shows updated name immediately.
- **Priority:** High

### TC-003 — Unchanged fields are preserved
- **Preconditions:** Edit form open for a program with multiple fields populated.
- **Steps:**
  1. Change only **Description**.
  2. Click **Save**.
- **Expected result:** Name and all untouched fields remain unchanged.
- **Priority:** High

## Negative flows

### TC-101 — Empty Name cannot be saved
- **Preconditions:** Edit form open.
- **Steps:**
  1. Clear **Name**.
  2. Click **Save**.
- **Expected result:** Validation error shown; save blocked; modal remains open.
- **Priority:** High

### TC-102 — Save failure does not close modal
- **Preconditions:** API/network failure simulated.
- **Steps:**
  1. Update **Name**.
  2. Click **Save** while failure is active.
- **Expected result:** Error displayed, modal stays open, data not updated in list.
- **Priority:** High

### TC-103 — Duplicate program name handling is enforced
- **Preconditions:** Another program exists with same target name.
- **Steps:**
  1. Set Name to existing program name.
  2. Save.
- **Expected result:** If unique constraint exists, save is rejected with clear message.
- **Priority:** High

## Edge cases

### TC-201 — Name at max length saves
- **Preconditions:** Known max Name length (N).
- **Steps:** Enter Name with exactly N characters and save.
- **Expected result:** Save succeeds; value persists correctly.
- **Priority:** Medium

### TC-202 — Name above max length is rejected/limited
- **Preconditions:** Known max Name length (N).
- **Steps:** Enter Name with N+1 characters and save.
- **Expected result:** Input is limited or validation blocks save.
- **Priority:** Medium

### TC-203 — Special characters are preserved
- **Preconditions:** Edit form open.
- **Steps:** Use `Web Development 2026 — "Beta" <cohort>` in Name and save.
- **Expected result:** Stored/displayed text matches expected encoding and characters.
- **Priority:** Medium

### TC-204 — Whitespace-only or trimmed names handled consistently
- **Preconditions:** Edit form open.
- **Steps:** Enter leading/trailing spaces or spaces-only value in Name and save.
- **Expected result:** Behavior follows product rule (trim + validate) with no hidden duplicates.
- **Priority:** Medium

## Ambiguities / gaps in ACs
- Full field list and required/optional status are not specified.
- Duplicate Name policy is not explicitly defined.
- Max lengths for Name/Description are not provided.
- Validation behavior for whitespace-only values is unspecified.
- Error handling expectations (timeouts/500/conflict) are not defined.
