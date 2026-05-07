# Test Plan: Create New Academic Program

## Scope

Validate that an admin can navigate to the program creation form, create a new academic program, and that validation prevents invalid submissions.

## Positive Flows

### TC-001

**Title:** Program creation form is displayed from the Programs page

**Preconditions:**
- User is logged in as an admin.
- User has access to the Programs page.

**Steps:**
1. Navigate to the Programs page.
2. Click `+ New Program`.

**Expected result:**
- Program creation form is displayed.
- Form contains the fields `Program Name` and `Description`.
- `Create` button is visible.

**Priority:** High

### TC-002

**Title:** Program is successfully created with valid name and description

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.

**Steps:**
1. Enter `Web Development 2026` in `Program Name`.
2. Enter `Full-stack web development program` in `Description`.
3. Click `Create`.

**Expected result:**
- Modal closes.
- Programs list is displayed.
- Program list contains `Web Development 2026`.

**Priority:** High

### TC-003

**Title:** Program is successfully created with a valid name and empty description

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.

**Steps:**
1. Enter `Data Analytics 2026` in `Program Name`.
2. Leave `Description` empty.
3. Click `Create`.

**Expected result:**
- Program is created successfully.
- Modal closes.
- Program list contains `Data Analytics 2026`.

**Priority:** Medium

## Negative Flows

### TC-004

**Title:** Create button remains disabled when Program Name is empty

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.

**Steps:**
1. Leave `Program Name` empty.
2. Enter `Program without a name` in `Description`.
3. Observe the `Create` button.

**Expected result:**
- `Create` button is disabled.
- Program cannot be submitted.

**Priority:** High

### TC-005

**Title:** Program is not created when Program Name contains only spaces

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.

**Steps:**
1. Enter three spaces in `Program Name`.
2. Enter `Whitespace name test` in `Description`.
3. Observe the `Create` button.

**Expected result:**
- `Create` button remains disabled, or validation error is shown.
- Program is not created.

**Priority:** High

### TC-006

**Title:** Duplicate program name is not created twice

**Preconditions:**
- User is logged in as an admin.
- Program `Web Development 2026` already exists.
- User is on the program creation form.

**Steps:**
1. Enter `Web Development 2026` in `Program Name`.
2. Enter `Duplicate program test` in `Description`.
3. Click `Create`.

**Expected result:**
- Duplicate program is not created.
- User sees a clear validation or error message.
- Existing program list does not contain two identical `Web Development 2026` entries.

**Priority:** High

### TC-007

**Title:** Program is not created when submission fails

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.
- Backend API or network request fails during creation.

**Steps:**
1. Enter `Cloud Engineering 2026` in `Program Name`.
2. Enter `Cloud infrastructure and DevOps program` in `Description`.
3. Click `Create`.

**Expected result:**
- Modal does not close unless the app intentionally closes it after showing an error.
- User sees a clear error message.
- `Cloud Engineering 2026` is not added to the program list.

**Priority:** High

## Edge Cases

### TC-008

**Title:** Program name with leading and trailing spaces is saved without extra whitespace

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.

**Steps:**
1. Enter `  Cybersecurity 2026  ` in `Program Name`.
2. Enter `Security fundamentals and applied defense` in `Description`.
3. Click `Create`.

**Expected result:**
- Program is created as `Cybersecurity 2026`.
- Leading and trailing spaces are trimmed.
- Program list does not show extra spaces.

**Priority:** Medium

### TC-009

**Title:** Program name supports valid special characters

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.

**Steps:**
1. Enter `AI & Machine Learning: 2026` in `Program Name`.
2. Enter `Artificial intelligence, ML, and applied data science` in `Description`.
3. Click `Create`.

**Expected result:**
- Program is created successfully.
- Program list shows `AI & Machine Learning: 2026` correctly.

**Priority:** Medium

### TC-010

**Title:** Program name rejects unsafe script content

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.

**Steps:**
1. Enter `<script>alert("xss")</script>` in `Program Name`.
2. Enter `Security validation test` in `Description`.
3. Click `Create`.

**Expected result:**
- Script is not executed.
- Input is either rejected with validation or safely escaped.
- Program list does not render executable HTML or JavaScript.

**Priority:** High

### TC-011

**Title:** Program name accepts minimum valid length

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.

**Steps:**
1. Enter `A` in `Program Name`.
2. Enter `Minimum length name test` in `Description`.
3. Click `Create`.

**Expected result:**
- If one character is allowed, program is created successfully.
- If a longer minimum is required, user sees a clear validation message.

**Priority:** Medium

### TC-012

**Title:** Program name at maximum allowed length is accepted

**Preconditions:**
- User is logged in as an admin.
- Maximum allowed `Program Name` length is defined.

**Steps:**
1. Enter a `Program Name` using exactly the maximum allowed number of characters.
2. Enter `Maximum valid length test` in `Description`.
3. Click `Create`.

**Expected result:**
- Program is created successfully.
- Program name is displayed correctly in the program list without truncation unless truncation is an intentional UI behavior.

**Priority:** Medium

### TC-013

**Title:** Program name above maximum allowed length is rejected

**Preconditions:**
- User is logged in as an admin.
- Maximum allowed `Program Name` length is defined.

**Steps:**
1. Enter a `Program Name` exceeding the maximum allowed length by one character.
2. Enter `Maximum length exceeded test` in `Description`.
3. Observe the form state.

**Expected result:**
- User cannot submit the form, or a validation error is shown.
- Program is not created.

**Priority:** Medium

### TC-014

**Title:** Description at maximum allowed length is handled correctly

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.
- Maximum allowed `Description` length is defined.

**Steps:**
1. Enter `Software Engineering 2026` in `Program Name`.
2. Enter a `Description` using exactly the maximum allowed number of characters.
3. Click `Create`.

**Expected result:**
- Program is created successfully.
- Description is saved and displayed correctly wherever descriptions are shown.

**Priority:** Low

### TC-015

**Title:** Long description above maximum allowed length is rejected

**Preconditions:**
- User is logged in as an admin.
- User is on the program creation form.
- Maximum allowed `Description` length is defined.

**Steps:**
1. Enter `Product Management 2026` in `Program Name`.
2. Enter a `Description` exceeding the maximum allowed length.
3. Observe the form state.

**Expected result:**
- User cannot submit the form, or a validation error is shown.
- Program is not created with an invalid description.

**Priority:** Medium

## Ambiguities and Gaps

- Maximum length for `Program Name` is not specified.
- Maximum length for `Description` is not specified.
- It is unclear whether `Description` is required or optional.
- Duplicate program name behavior is not defined.
- Expected validation message text is not defined.
- It is unclear whether whitespace should be trimmed before saving.
- Allowed special characters for `Program Name` are not defined.
- Error handling behavior for failed API requests is not specified.
- It is unclear whether program creation happens in a modal, page, or drawer, though the AC says "modal closes."
- Sorting or placement of the newly created program in the list is not specified.
