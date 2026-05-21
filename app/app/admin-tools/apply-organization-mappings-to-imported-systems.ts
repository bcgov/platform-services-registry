import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { logger } from '@/core/logging';
import prisma from './prisma';

const cliArgsSchema = z.object({
  input: z.string().min(1).optional(),
  dryRun: z.boolean().default(false),
  clearMissing: z.boolean().default(false),
});

const outputDirectory = 'app/admin-tools/output';

type MappingCsvRow = {
  sourceField: string;
  importedValue: string;
  importedSystemCount: string;
  importedSystemsSample: string;
  bestGuessOrganizationId: string;
  bestGuessOrganizationCode: string;
  bestGuessOrganizationName: string;
  bestGuessScore: string;
  bestGuessRationale: string;
  alternateGuesses: string;
};

type ImportedSystemRow = {
  id: string;
  name: string;
  code: string;
  organizationId: string | null;
  metadata: unknown;
};

function parseArgs(argv: string[]) {
  const rawArgs = argv.slice(2);
  const input: Record<string, unknown> = {
    dryRun: false,
    clearMissing: false,
  };

  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];

    if (token === '--dry-run') {
      input.dryRun = true;
      continue;
    }

    if (token === '--clear-missing') {
      input.clearMissing = true;
      continue;
    }

    const value = rawArgs[i + 1];
    if (!value) continue;

    if (token === '--input') {
      input.input = value;
      i += 1;
    }
  }

  return cliArgsSchema.parse(input);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function getDivisionImportRaw(metadata: unknown) {
  if (!isObjectRecord(metadata)) return null;
  const divisionImport = metadata.divisionImport;
  if (!isObjectRecord(divisionImport)) return null;
  const raw = divisionImport.raw;
  return isObjectRecord(raw) ? raw : null;
}

function getImportedAcronym(system: ImportedSystemRow) {
  const raw = getDivisionImportRaw(system.metadata);
  if (!raw) return null;
  return normalizeWhitespace(getString(raw['Ministry/Sector Acronym']) ?? '');
}

async function resolveInputPath(input?: string) {
  if (input) {
    return path.resolve(process.cwd(), input);
  }

  const outputPath = path.resolve(process.cwd(), outputDirectory);
  const entries = await readdir(outputPath);
  const matching = entries
    .filter((entry) => /^imported-system-org-mapping-.*\.csv$/.test(entry))
    .sort()
    .reverse();

  if (matching.length === 0) {
    throw new Error('No imported-system-org-mapping CSV file found in app/admin-tools/output.');
  }

  return path.join(outputPath, matching[0]);
}

async function loadCsv(filePath: string) {
  const fileContents = await readFile(filePath, 'utf8');
  return parse(fileContents, {
    columns: true,
    skip_empty_lines: true,
  }) as MappingCsvRow[];
}

async function main() {
  const { input, dryRun, clearMissing } = parseArgs(process.argv);
  const inputPath = await resolveInputPath(input);
  const rows = await loadCsv(inputPath);

  const mappingByImportedValue = new Map<string, MappingCsvRow>();
  for (const row of rows) {
    if (normalizeWhitespace(row.sourceField) !== 'Ministry/Sector Acronym') continue;
    const importedValue = normalizeWhitespace(row.importedValue);
    if (!importedValue) continue;
    mappingByImportedValue.set(importedValue, row);
  }

  const [organizations, systems] = await Promise.all([
    prisma.organization.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { code: 'asc' },
    }),
    prisma.system.findMany({
      where: {
        originKind: 'IMPORTED_OTHER',
      },
      select: {
        id: true,
        name: true,
        code: true,
        organizationId: true,
        metadata: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const organizationByCode = new Map(organizations.map((org) => [normalizeWhitespace(org.code), org]));
  const updates: Array<{
    id: string;
    name: string;
    code: string;
    acronym: string;
    fromOrganizationId: string | null;
    toOrganizationId: string | null;
    toOrganizationCode: string | null;
    toOrganizationName: string | null;
  }> = [];
  const skipped: Array<{
    id: string;
    name: string;
    code: string;
    acronym: string | null;
    reason: string;
  }> = [];

  for (const system of systems) {
    const acronym = getImportedAcronym(system);
    if (!acronym) {
      skipped.push({
        id: system.id,
        name: system.name,
        code: system.code,
        acronym: null,
        reason: 'No Ministry/Sector Acronym found in imported metadata.',
      });
      continue;
    }

    const mappingRow = mappingByImportedValue.get(acronym);
    if (!mappingRow) {
      skipped.push({
        id: system.id,
        name: system.name,
        code: system.code,
        acronym,
        reason: 'No mapping row found for this acronym in the CSV.',
      });
      continue;
    }

    const bestGuessOrganizationCode = normalizeWhitespace(mappingRow.bestGuessOrganizationCode ?? '');
    if (!bestGuessOrganizationCode) {
      if (clearMissing && system.organizationId) {
        updates.push({
          id: system.id,
          name: system.name,
          code: system.code,
          acronym,
          fromOrganizationId: system.organizationId,
          toOrganizationId: null,
          toOrganizationCode: null,
          toOrganizationName: null,
        });
      } else {
        skipped.push({
          id: system.id,
          name: system.name,
          code: system.code,
          acronym,
          reason: 'CSV row has no bestGuessOrganizationCode.',
        });
      }
      continue;
    }

    const targetOrganization = organizationByCode.get(bestGuessOrganizationCode);
    if (!targetOrganization) {
      skipped.push({
        id: system.id,
        name: system.name,
        code: system.code,
        acronym,
        reason: `Organization code "${bestGuessOrganizationCode}" was not found in the database.`,
      });
      continue;
    }

    if (system.organizationId === targetOrganization.id) {
      continue;
    }

    updates.push({
      id: system.id,
      name: system.name,
      code: system.code,
      acronym,
      fromOrganizationId: system.organizationId,
      toOrganizationId: targetOrganization.id,
      toOrganizationCode: targetOrganization.code,
      toOrganizationName: targetOrganization.name,
    });
  }

  if (!dryRun) {
    for (const update of updates) {
      await prisma.system.update({
        where: { id: update.id },
        data: {
          organizationId: update.toOrganizationId,
        },
      });
    }
  }

  const summary = {
    ok: true,
    dryRun,
    inputPath,
    clearMissing,
    scannedSystems: systems.length,
    mappingRows: mappingByImportedValue.size,
    organizations: organizations.length,
    changed: updates.length,
    skipped: skipped.length,
    updates,
    skippedRows: skipped,
  };

  logger.info('apply-organization-mappings-to-imported-systems completed', {
    dryRun,
    inputPath,
    scannedSystems: summary.scannedSystems,
    changed: summary.changed,
    skipped: summary.skipped,
  });

  console.log(
    `${dryRun ? 'Dry run:' : 'Updated:'} ${
      summary.changed
    } imported Systems matched organization mappings from ${path.basename(inputPath)}. ${
      summary.skipped
    } Systems were skipped.`,
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  logger.error('apply-organization-mappings-to-imported-systems failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
