## Program List Filtering and Display - QA Test Plan

### Positive Flows

**TC-001**  
- **Title:** Programs page shows list with name and description for existing programs  
- **Preconditions:**  
  - Programs exist:  
    - Program Name: `Cardiology Care`, Description: `Heart health management`  
    - Program Name: `Pediatrics Plus`, Description: `Child wellness and preventive care`  
- **Steps:**  
  1. Sign in as QA user.  
  2. Navigate to the Programs page.  
- **Expected result:**  
  - Two program rows appear.  
  - Each row shows Program Name and Program Description exactly as saved.  
- **Priority:** High

**TC-002**  
- **Title:** Programs page shows empty-state message and create-first-program prompt when no programs exist  
- **Preconditions:**  
  - Programs dataset is empty.  
- **Steps:**  
  1. Sign in as QA user.  
  2. Navigate to the Programs page.  
- **Expected result:**  
  - Message indicates no programs have been created.  
  - A clear prompt/action to create the first program is visible.  
- **Priority:** High

**TC-003**  
- **Title:** Program filtering shows only matching programs by name  
- **Preconditions:**  
  - Programs exist: `Cardiology Care`, `Cardiac Rehab`, `Dermatology Basics`  
  - Filter input is available on Programs page.  
- **Steps:**  
  1. Navigate to the Programs page.  
  2. In Program Name filter, enter `card`.  
- **Expected result:**  
  - Only `Cardiology Care` and `Cardiac Rehab` remain visible.  
  - Non-matching programs are hidden.  
- **Priority:** High

### Negative Flows

**TC-004**  
- **Title:** Programs page does not show empty-state when at least one program exists  
- **Preconditions:**  
  - Program exists: Program Name `Oncology Core`, Description `Cancer treatment coordination`  
- **Steps:**  
  1. Navigate to the Programs page.  
- **Expected result:**  
  - List view is shown.  
  - Empty-state message and create-first-program prompt are not displayed.  
- **Priority:** High

**TC-005**  
- **Title:** Filtering with unmatched value returns no results without displaying global empty-state text  
- **Preconditions:**  
  - Programs exist: `Oncology Core`, `Pulmonary Assist`  
  - Filter input is available.  
- **Steps:**  
  1. Navigate to the Programs page.  
  2. Enter `neurology` in Program Name filter.  
- **Expected result:**  
  - No program rows are shown for filter results.  
  - Global `no programs have been created` message is not shown because programs exist in system.  
- **Priority:** Medium

**TC-006**  
- **Title:** Program row does not render unrelated fields in name/description columns  
- **Preconditions:**  
  - Program exists with additional metadata (internal ID, created date, owner).  
- **Steps:**  
  1. Navigate to the Programs page.  
- **Expected result:**  
  - Only Program Name and Program Description are shown for this feature scope.  
  - Internal metadata is not mixed into these fields.  
- **Priority:** Low

### Edge Cases

**TC-007**  
- **Title:** Program with empty description still renders name and does not break list layout  
- **Preconditions:**  
  - Program exists: Program Name `General Medicine`, Description `` (empty string)  
- **Steps:**  
  1. Navigate to the Programs page.  
- **Expected result:**  
  - Row is visible with Program Name `General Medicine`.  
  - Description cell is blank or shows approved fallback behavior.  
  - No layout break occurs.  
- **Priority:** Medium

**TC-008**  
- **Title:** Program names with special characters render safely and can be filtered  
- **Preconditions:**  
  - Programs exist:  
    - `Women's Health & Wellness` / `Comprehensive care`  
    - `<script>alert(1)</script>` / `Security test data`  
- **Steps:**  
  1. Navigate to the Programs page.  
  2. Filter by `women`.  
  3. Clear filter and filter by `<script>`.  
- **Expected result:**  
  - Special characters are displayed as text (escaped).  
  - No script executes.  
  - Matching filter results return correctly.  
- **Priority:** High

**TC-009**  
- **Title:** Duplicate program names appear as separate rows with correct descriptions  
- **Preconditions:**  
  - Programs exist:  
    - `Nutrition Track` / `Adult program`  
    - `Nutrition Track` / `Pediatric program`  
- **Steps:**  
  1. Navigate to the Programs page.  
- **Expected result:**  
  - Both rows are present.  
  - Rows remain distinct by description; one duplicate does not overwrite/hide the other.  
- **Priority:** Medium

**TC-010**  
- **Title:** Maximum-length program name and description render without truncation defects  
- **Preconditions:**  
  - Program exists with max allowed lengths (for example: name 255 chars, description 2000 chars).  
- **Steps:**  
  1. Navigate to the Programs page.  
- **Expected result:**  
  - Row renders without UI breakage, overflow corruption, or character loss.  
  - Any truncation follows intended product design.  
- **Priority:** Medium

**TC-011**  
- **Title:** Filter input handles boundary values (empty string and whitespace-only input)  
- **Preconditions:**  
  - Programs exist: `Cardiology Care`, `Dermatology Basics`  
  - Filter input is available.  
- **Steps:**  
  1. Enter empty string in filter.  
  2. Enter single space.  
  3. Enter ` card ` (leading/trailing spaces).  
- **Expected result:**  
  - Empty or whitespace-only input behaves like no filter (all programs shown).  
  - Spacing around valid text is handled consistently (trim behavior defined and stable).  
- **Priority:** Medium

**TC-012**  
- **Title:** Filtering is case-insensitive and supports non-Latin characters  
- **Preconditions:**  
  - Programs exist: `Cardiology Care`, `Клиника сердца`  
  - Filter input is available.  
- **Steps:**  
  1. Filter with `CARD`.  
  2. Filter with `клиника`.  
- **Expected result:**  
  - Matching is case-insensitive for supported locales/character sets.  
  - Correct rows are returned.  
- **Priority:** Low

## Ambiguities / Gaps in the Acceptance Criteria

- ACs describe list display and empty state, but do not explicitly define filtering behavior (despite feature scope including filtering).  
- Exact empty-state text and CTA label are not specified.  
- Sorting/default order for program rows is not defined.  
- Behavior for missing/null description is not defined (blank vs fallback text).  
- Maximum allowed lengths for Program Name and Description are not stated.  
- Accessibility expectations are not included (keyboard nav, focus order, screen reader semantics).  
- No performance requirement is defined for large datasets or filter response time.  
