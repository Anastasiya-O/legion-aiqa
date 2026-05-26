# DS-1 — Create new academic program

Feature: DS-1 Create new academic program
  As an admin user
  I want to create a new academic program
  So that I can begin designing its curriculum structure

# Happy paths

Scenario: Navigate to program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
  And I see the Create button

Scenario: Successfully create a program with name and description
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"

Scenario: Successfully create a program with name and empty description
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Data Analytics 2026"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Analytics 2026"

# Negative

Scenario: Validation prevents empty program name
  Given I am logged in as admin
  And I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled

Scenario: Create button stays disabled when Program Name has only spaces
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "   "
  And I fill in Description with "Whitespace name test"
  Then the Create button is disabled
  And no new program is added to the program list

Scenario: Program is not created when Program Name is empty but Description is filled
  Given I am logged in as admin
  And I am on the program creation form
  When I leave the Program Name field empty
  And I fill in Description with "Program without a name"
  Then the Create button is disabled
  And I cannot submit the form

Scenario: Duplicate program name is not created twice
  Given I am logged in as admin
  And a program named "Web Development 2026" already exists in the program list
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate program test"
  And I click Create
  Then the program list does not contain two entries named "Web Development 2026"
  And I see a clear validation or error message, or the creation modal remains open

Scenario: Program is not created when the create request fails
  Given I am logged in as admin
  And I am on the program creation form
  And the backend API fails when I submit the form
  When I fill in Program Name with "Cloud Engineering 2026"
  And I fill in Description with "Cloud infrastructure and DevOps program"
  And I click Create
  Then the modal does not close without showing an error
  And I see a clear error message
  And the program list does not show "Cloud Engineering 2026"

# Edge cases

Scenario: Program name with leading and trailing spaces is trimmed on save
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "  Cybersecurity 2026  "
  And I fill in Description with "Security fundamentals and applied defense"
  And I click Create
  Then the modal closes
  And the program list shows "Cybersecurity 2026"
  And the program list does not show leading or trailing spaces around the name

Scenario: Program name supports valid special characters
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "AI & Machine Learning: 2026"
  And I fill in Description with "Artificial intelligence, ML, and applied data science"
  And I click Create
  Then the modal closes
  And the program list shows "AI & Machine Learning: 2026"

Scenario: Program name rejects unsafe script content
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "<script>alert(\"xss\")</script>"
  And I fill in Description with "Security validation test"
  And I click Create
  Then script content is not executed in the UI
  And the program list does not render executable HTML or JavaScript from the name field

Scenario: Program name accepts minimum valid length
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Minimum length name test"
  And I click Create
  Then either the program is created with name "A"
  Or I see a clear validation message that the name is too short

Scenario: Program name at maximum allowed length is accepted
  Given I am logged in as admin
  And I am on the program creation form
  And the maximum allowed Program Name length is N characters
  When I fill in Program Name with a string of exactly N characters
  And I fill in Description with "Maximum valid length test"
  And I click Create
  Then the modal closes
  And the program list shows the full N-character name without unintended truncation

Scenario: Program name above maximum allowed length is rejected
  Given I am logged in as admin
  And I am on the program creation form
  And the maximum allowed Program Name length is N characters
  When I fill in Program Name with a string of N+1 characters
  And I fill in Description with "Maximum length exceeded test"
  Then the Create button is disabled or a validation error is shown
  And no new program is added to the program list

Scenario: Description at maximum allowed length is saved correctly
  Given I am logged in as admin
  And I am on the program creation form
  And the maximum allowed Description length is M characters
  When I fill in Program Name with "Software Engineering 2026"
  And I fill in Description with a string of exactly M characters
  And I click Create
  Then the modal closes
  And the program list shows "Software Engineering 2026"
  And the saved description is displayed correctly wherever descriptions are shown

Scenario: Description above maximum allowed length is rejected
  Given I am logged in as admin
  And I am on the program creation form
  And the maximum allowed Description length is M characters
  When I fill in Program Name with "Product Management 2026"
  And I fill in Description with a string longer than M characters
  Then the Create button is disabled or a validation error is shown
  And no new program is added to the program list

<!--
## Ambiguities and gaps (from DS-1 acceptance criteria)

- Maximum length for Program Name is not specified in the ticket (edge scenarios use N as unknown).
- Maximum length for Description is not specified in the ticket (edge scenarios use M as unknown).
- Description is optional in practice but not stated explicitly in the ticket AC.
- Duplicate program name behavior is not defined (reject vs. allow vs. silent failure).
- Expected validation message copy is not defined for empty name, whitespace-only name, or duplicates.
- Whether Program Name whitespace is trimmed before save is not specified (only implied by good UX).
- Allowed special characters for Program Name are not enumerated.
- API error handling (modal stays open, toast, inline error) is not specified in the ticket.
- The ticket AC references a modal closing on success; container type on failure is unspecified.
- Sort order or position of a newly created program in the list is not specified.
- Confluence reference "Program Setup & Management > Overview" may contain additional rules not reflected in Jira AC.
-->
