# Test Plan: React TodoMVC (Playwright demo)

**Application under test:** [https://demo.playwright.dev/todomvc/#/](https://demo.playwright.dev/todomvc/#/)  
**Note (from app):** “This is just a demo of TodoMVC for testing, not the real TodoMVC app.”

## UI reference (verified field names and copy)

| Element | Selector / copy |
|--------|-------------------|
| Page heading | `h1` text: **todos** |
| New todo field | `input.new-todo`, placeholder: **What needs to be done?** |
| Todo rows | `section.main` → `ul.todo-list` → `li` (class `completed` when finished) |
| Complete toggle | `li .toggle` (checkbox) |
| Visible label | `li label` (row text) |
| Remove | `li .destroy` (visible on row hover in this build) |
| Items left | `.todo-count` — **1 item left** (singular) or **N items left** (plural) |
| Filters | `.filters a`: **All**, **Active**, **Completed** |
| Clear finished | `.clear-completed` — **Clear completed** (visible when at least one todo is completed) |
| Edit affordance | `.info` includes: **Double-click to edit a todo**; in-row editor: `li .edit` after double-click on `label` |

---

## Positive flows

### TC-001

- **Title:** Empty list shows capture UI without todo rows or list chrome  
- **Preconditions:** Browser navigated to `https://demo.playwright.dev/todomvc/#/` with a clean session (no local todos).  
- **Steps:**  
  1. Observe the header `todos`.  
  2. Locate `input.new-todo` and read its placeholder.  
  3. Confirm `ul.todo-list` has zero `li` children (or equivalent empty list).  
  4. Confirm the main footer block (`.footer` with `.todo-count` and filters) is not shown for an empty list.  
- **Expected result:** Placeholder is **What needs to be done?**; no todos listed; no active-item counter/footer for todos.  
- **Priority:** High  
- **AC coverage:** AC1 (baseline for “create a todo list” — empty list state)

### TC-002

- **Title:** First submitted todo appears as a single active row  
- **Preconditions:** Same as TC-001.  
- **Steps:**  
  1. Type `Buy oat milk` into `input.new-todo`.  
  2. Press **Enter**.  
- **Expected result:** One `li` appears under `ul.todo-list`; `label` text is exactly `Buy oat milk`; row is not `completed`; `.todo-count` reads **1 item left**; footer with **All** / **Active** / **Completed** is visible.  
- **Priority:** High  
- **AC coverage:** AC1, AC2

### TC-003

- **Title:** User can add four distinct todos and see all four in creation order  
- **Preconditions:** Clean page at the app URL.  
- **Steps:**  
  1. Enter `Pay electricity bill` → **Enter**.  
  2. Enter `Book dentist` → **Enter**.  
  3. Enter `Reply to Alex` → **Enter**.  
  4. Enter `Water plants` → **Enter**.  
- **Expected result:** Four `li` rows exist; labels in order: `Pay electricity bill`, `Book dentist`, `Reply to Alex`, `Water plants`; `.todo-count` is **4 items left**.  
- **Priority:** High  
- **AC coverage:** AC2

### TC-004

- **Title:** Completing a todo marks that row as finished while others stay active  
- **Preconditions:** Four todos from TC-003 are present (`Pay electricity bill` … `Water plants`).  
- **Steps:**  
  1. Click the `.toggle` checkbox on the row whose label is `Book dentist`.  
  2. Inspect that row’s `li` class and the checkbox state.  
  3. Inspect the other three rows.  
- **Expected result:** The `Book dentist` row has class including `completed` and its `.toggle` is checked; the other three rows remain unchecked and not `completed`; `.todo-count` becomes **3 items left**.  
- **Priority:** High  
- **AC coverage:** AC3

### TC-005

- **Title:** Destroy removes only the targeted todo  
- **Preconditions:** Four todos from TC-003; `Book dentist` remains completed per TC-004 (optional but realistic).  
- **Steps:**  
  1. Hover the row labeled `Reply to Alex` so `.destroy` is visible.  
  2. Click `.destroy` on that row.  
- **Expected result:** No row with label `Reply to Alex`; remaining labels are exactly `Pay electricity bill`, `Book dentist` (if still present), `Water plants` — adjust expected count to match pre-step list minus one; counter matches number of remaining **active** (non-completed) todos per app rules.  
- **Priority:** High  
- **AC coverage:** AC4

### TC-006

- **Title:** “Clear completed” removes all finished rows and leaves actives  
- **Preconditions:** At least two todos: one completed (`Walk dog`), one active (`Read chapter 4`).  
- **Steps:**  
  1. Ensure `Walk dog` is checked via `.toggle`.  
  2. Click **Clear completed**.  
- **Expected result:** `Walk dog` row gone; `Read chapter 4` remains; **Clear completed** is hidden if no completed rows remain.  
- **Priority:** Medium  
- **AC coverage:** AC3 (bulk finish cleanup), AC4 (removal semantics)

### TC-007

- **Title:** Active filter lists only unchecked todos; All restores full list  
- **Preconditions:** Two todos: `Alpha` active, `Beta` completed.  
- **Steps:**  
  1. Click filter **Active**.  
  2. Count visible `li` rows and read labels.  
  3. Click filter **All**.  
- **Expected result:** On **Active**, only `Alpha` is listed; on **All**, both `Alpha` and `Beta` appear (with `Beta` still visually completed).  
- **Priority:** Medium  
- **AC coverage:** Supports AC2–AC4 visibility (not deleting data)

### TC-008

- **Title:** Double-click edit updates label text after commit  
- **Preconditions:** One todo `edit me`.  
- **Steps:**  
  1. Double-click the `label` for `edit me`.  
  2. In `li .edit`, replace text with `edited` and press **Enter**.  
- **Expected result:** Row label reads `edited`; no duplicate row created.  
- **Priority:** Medium  
- **AC coverage:** AC2 (item identity after edit)

---

## Negative flows

### TC-009

- **Title:** Pressing Enter on an empty new-todo must not create a row or increment counts  
- **Preconditions:** Clean page.  
- **Steps:**  
  1. Focus `input.new-todo` without typing.  
  2. Press **Enter**.  
- **Expected result:** Still zero `li` under `ul.todo-list`; no `.footer` for counts.  
- **Priority:** High  
- **AC coverage:** Guards AC2 (no phantom “fourth” slot)

### TC-010

- **Title:** Whitespace-only submission must not create a todo  
- **Preconditions:** Clean page.  
- **Steps:**  
  1. Type three spaces `   ` into `input.new-todo`.  
  2. Press **Enter**.  
- **Expected result:** No new `li`; list remains empty.  
- **Priority:** High  

### TC-011

- **Title:** Completing one todo must not auto-complete sibling todos  
- **Preconditions:** Two active todos `Only A` and `Only B`.  
- **Steps:**  
  1. Check `.toggle` only on `Only A`.  
- **Expected result:** `Only A` is `completed`; `Only B` remains unchecked and not `completed`.  
- **Priority:** High  
- **AC coverage:** AC3 (precision of “finish item”)

### TC-012

- **Title:** Destroy on one row must not remove other rows  
- **Preconditions:** Two todos `Keep` and `Drop`.  
- **Steps:**  
  1. Hover `Drop`, click its `.destroy`.  
- **Expected result:** Exactly one row remains with label `Keep`; `Drop` absent.  
- **Priority:** High  
- **AC coverage:** AC4

### TC-013

- **Title:** Switching filters must not delete or merge stored todos  
- **Preconditions:** `Done task` completed, `Open task` active.  
- **Steps:**  
  1. Click **Completed**, then **Active**, then **All** in sequence.  
- **Expected result:** After returning to **All**, both todos still exist with prior completion states.  
- **Priority:** Medium  

---

## Edge cases

### TC-014

- **Title:** Duplicate titles are allowed as separate rows  
- **Preconditions:** Clean page.  
- **Steps:**  
  1. Add `Same text` → **Enter**.  
  2. Add `Same text` again → **Enter**.  
- **Expected result:** Two `li` rows, both labels `Same text`; counter **2 items left**.  
- **Priority:** Medium  

### TC-015

- **Title:** Very long single-line text is accepted without truncation (regression watch)  
- **Preconditions:** Clean page.  
- **Steps:**  
  1. Paste a string of **5000** `x` characters into `input.new-todo`.  
  2. Press **Enter**.  
- **Expected result:** One row whose `label` length is **5000** characters (spot-check first/last characters).  
- **Priority:** Low  

### TC-016

- **Title:** Angle-bracket text is stored and shown as literal label (no script execution)  
- **Preconditions:** Clean page.  
- **Steps:**  
  1. Enter `<script>alert(1)</script>` → **Enter**.  
  2. Observe label text and that no dialog appears.  
- **Expected result:** Label displays the literal string (DOM text), page remains stable.  
- **Priority:** Medium  

### TC-017

- **Title:** Counter grammar switches between singular and plural correctly  
- **Preconditions:** Clean page.  
- **Steps:**  
  1. Add one todo → read `.todo-count`.  
  2. Add second todo → read `.todo-count`.  
- **Expected result:** After one todo: **1 item left**; after two: **2 items left**.  
- **Priority:** Low  

### TC-018

- **Title:** Rapid sequential adds preserve order and count  
- **Preconditions:** Clean page.  
- **Steps:**  
  1. Quickly add `T1`, `T2`, `T3`, `T4` with **Enter** after each (no pauses).  
- **Expected result:** Order `T1`…`T4` top-to-bottom; **4 items left**.  
- **Priority:** Medium  
- **AC coverage:** AC2 stress variant

### TC-019

- **Title:** Unchecking a completed todo returns it to active and updates counts/filters  
- **Preconditions:** One completed todo `Reopen me`.  
- **Steps:**  
  1. Uncheck its `.toggle`.  
  2. If on **Active** filter, confirm row appears.  
- **Expected result:** Row no longer `completed`; included under **Active**; count increases accordingly.  
- **Priority:** Low  

---

## Ambiguities and gaps in the acceptance criteria

1. **“Create a todo list”** does not say whether an empty page counts as a list, or whether persistence (reload) is required; this plan treats “list” as the in-page structure after at least one add, with TC-001 documenting the empty shell.  
2. **“Add items (4)”** does not specify required text, uniqueness, or order; TC-003 uses concrete titles; TC-014 allows duplicates — clarify product rule if duplicates must be rejected.  
3. **“Finish item”** does not define visual completion (strikethrough vs class only); this plan asserts `completed` class + checked `.toggle` as observed on the demo.  
4. **“Remove item”** does not specify interaction (destroy vs clear-completed vs filter); TC-005 uses per-row **destroy**; TC-006 covers bulk clear — confirm which removals are in scope for your product definition.  
5. **Persistence, auth, offline, and performance** are out of scope for the stated ACs but matter for a real product.  
6. **Accessibility** (keyboard-only destroy, focus order, ARIA) is not in the ACs; add if required.

---

## Revalidation against acceptance criteria

| AC | Requirement | Test case IDs |
|----|----------------|---------------|
| 1 | Create a todo list | TC-001, TC-002 |
| 2 | Add items (4) | TC-002, TC-003, TC-018 |
| 3 | Finish item; expect finished | TC-004, TC-006, TC-011, TC-019 |
| 4 | Remove item; expect removed | TC-005, TC-006, TC-012 |

Every AC is covered by at least one **High**-priority case in Positive or Negative flows; additional Medium/Low cases extend filters, editing, bulk clear, and grammar.
