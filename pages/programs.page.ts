import { type Locator, type Page } from '@playwright/test';
import { AppNavigation } from './components/app-navigation';
import { NewProgramModal } from './components/new-program.modal';
import { EditProgramModal } from './components/edit-program.modal';

/**
 * Programs screen at `/programs` — the main CRUD surface for DS-1 / DS-2 tests.
 *
 * Composes the shared {@link AppNavigation} and the {@link NewProgramModal} /
 * {@link EditProgramModal} components. Methods perform actions only; all
 * assertions live in the spec files.
 *
 * Delete uses a native browser `confirm` dialog, so `deleteButtonFor` is
 * exposed as a locator and the dialog handling stays in the test.
 */
export class ProgramsPage {
  readonly nav: AppNavigation;
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;

  readonly heading: Locator;
  readonly newProgramButton: Locator;
  /** Empty-state CTA, named "Create Program" — distinct from the modal "Create". */
  readonly createFirstProgramButton: Locator;
  readonly emptyState: Locator;
  readonly table: Locator;
  readonly programColumnHeader: Locator;

  // Selected-program panel
  readonly manageCoursesButton: Locator;
  readonly generateCurriculumButton: Locator;
  readonly addSemesterButton: Locator;

  constructor(private readonly page: Page) {
    this.nav = new AppNavigation(page);
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);

    this.heading = page.getByRole('heading', { name: 'Programs', level: 2 });
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.createFirstProgramButton = page.getByRole('button', { name: 'Create Program' });
    this.emptyState = page.getByText(/No programs yet/i);
    this.table = page.getByRole('table');
    this.programColumnHeader = page.getByRole('columnheader', { name: 'Program' });

    this.manageCoursesButton = page.getByRole('button', { name: 'Manage Courses' });
    this.generateCurriculumButton = page.getByRole('button', { name: /Generate Curriculum/ });
    this.addSemesterButton = page.getByRole('button', { name: '+ Semester' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs');
  }

  /** First row whose name cell contains this exact title. */
  programRow(programName: string): Locator {
    return this.page
      .locator('tbody tr')
      .filter({ has: this.page.getByText(programName, { exact: true }) })
      .first();
  }

  /** All rows matching the name (useful for duplicate-name assertions). */
  programRows(programName: string): Locator {
    return this.page
      .locator('tbody tr')
      .filter({ has: this.page.getByText(programName, { exact: true }) });
  }

  /** Row Edit action, addressed by accessible name "Edit <program name>". */
  editButtonFor(programName: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${programName}` });
  }

  /** Row Delete action, addressed by accessible name "Delete <program name>". */
  deleteButtonFor(programName: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${programName}` });
  }

  async openNewProgram(): Promise<void> {
    await this.newProgramButton.click();
  }

  async openEditFor(programName: string): Promise<void> {
    await this.editButtonFor(programName).click();
  }

  /** Open the selected program's semesters/scheduling panel. */
  async selectProgram(programName: string): Promise<void> {
    await this.programRow(programName).click();
  }

  /**
   * Create a program through the New Program dialog and return its id/uuid.
   * Navigates to the page, opens the dialog, fills it, and submits. Expects
   * creation to succeed; caller is responsible for cleanup tracking.
   */
  async createProgram(name: string, description = ''): Promise<string> {
    await this.goto();
    await this.openNewProgram();
    await this.newProgramModal.fillName(name);
    if (description.length > 0) {
      await this.newProgramModal.fillDescription(description);
    }
    return this.newProgramModal.submitAndGetProgramId();
  }
}
