#!/usr/bin/env npx tsx
import { deleteProgram, fetchPrograms, type DeleteResult, type Program } from '../../../../support/delete-program';

interface Cli {
  dryRun: boolean;
  ids: string[];
}

function parseArgs(argv: string[]): Cli {
  const cli: Cli = { dryRun: false, ids: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      cli.dryRun = true;
    } else if (arg === '--all') {
      // explicit opt-in to the default behaviour; nothing to set
    } else if (arg === '--id') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--id requires a program UUID');
      }
      cli.ids.push(value);
      i += 1;
    } else if (arg.startsWith('--id=')) {
      cli.ids.push(arg.slice('--id='.length));
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return cli;
}

async function resolveTargets(cli: Cli): Promise<{ targets: Program[]; foundViaGet: number; scope: string }> {
  if (cli.ids.length > 0) {
    return {
      targets: cli.ids.map((id) => ({ id })),
      foundViaGet: 0,
      scope: 'specific UUID(s)',
    };
  }
  const programs = await fetchPrograms();
  return { targets: programs, foundViaGet: programs.length, scope: 'all programs' };
}

function printReport(scope: string, foundViaGet: number, results: DeleteResult[], dryRun: boolean): void {
  const deleted = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok && r.status !== 404);
  const alreadyGone = results.filter((r) => r.status === 404);

  console.log('');
  console.log(`**Scope:** ${scope}${dryRun ? ' (dry run)' : ''}`);
  console.log(`**Found via GET:** ${foundViaGet}`);

  if (dryRun) {
    console.log(`**Would delete:** ${results.map((r) => r.uuid).join(', ') || 'none'}`);
    return;
  }

  console.log(`**Deleted:** ${[...deleted, ...alreadyGone].map((r) => r.uuid).join(', ') || 'none'}`);
  console.log(
    `**Failed:** ${
      failed.length === 0 ? 'none' : failed.map((r) => `${r.uuid} (${r.status} ${r.message})`).join(', ')
    }`,
  );
}

async function main(): Promise<void> {
  const cli = parseArgs(process.argv.slice(2));
  const { targets, foundViaGet, scope } = await resolveTargets(cli);

  if (targets.length === 0) {
    console.log(`**Scope:** ${scope}`);
    console.log(`**Found via GET:** ${foundViaGet}`);
    console.log('No programs to delete.');
    return;
  }

  if (cli.dryRun) {
    for (const t of targets) {
      console.log(`[dry-run] would DELETE ${t.id}${t.name ? ` (${t.name})` : ''}`);
    }
    printReport(
      scope,
      foundViaGet,
      targets.map((t) => ({ uuid: t.id, status: 0, ok: false, message: 'dry-run' })),
      true,
    );
    return;
  }

  const results: DeleteResult[] = [];
  for (const target of targets) {
    const result = await deleteProgram(target.id);
    const label = result.ok ? 'deleted' : result.status === 404 ? 'already removed' : 'FAILED';
    console.log(`[${label}] ${result.uuid} — ${result.status} ${result.message}`);
    results.push(result);
  }

  printReport(scope, foundViaGet, results, false);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
