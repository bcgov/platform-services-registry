import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '@/core/logging';
import prisma from './prisma';

const cliArgsSchema = z.object({
  csvOut: z.string().min(1).optional(),
  jsonOut: z.string().min(1).optional(),
  mdOut: z.string().min(1).optional(),
  sampleLimit: z.coerce.number().int().positive().default(5),
});

const outputDirectory = 'app/admin-tools/output';

type ImportedSystemRow = {
  id: string;
  name: string;
  code: string;
  metadata: unknown;
};

type OrganizationRow = {
  id: string;
  code: string;
  name: string;
};

type MappingField = 'Ministry/Sector Acronym';

type MappingCandidate = {
  organizationId: string;
  organizationCode: string;
  organizationName: string;
  score: number;
  rationale: string[];
};

type MappingRow = {
  sourceField: MappingField;
  importedValue: string;
  importedSystemCount: number;
  importedSystemsSample: Array<{ id: string; name: string; code: string }>;
  bestGuess: MappingCandidate | null;
  alternateGuesses: MappingCandidate[];
};

function parseArgs(argv: string[]) {
  const rawArgs = argv.slice(2);
  const args: Record<string, string> = {};

  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];
    const value = rawArgs[i + 1];
    if (!value) continue;

    if (token === '--csv-out') {
      args.csvOut = value;
      i += 1;
      continue;
    }

    if (token === '--json-out') {
      args.jsonOut = value;
      i += 1;
      continue;
    }

    if (token === '--md-out') {
      args.mdOut = value;
      i += 1;
      continue;
    }

    if (token === '--sample-limit') {
      args.sampleLimit = value;
      i += 1;
    }
  }

  return cliArgsSchema.parse(args);
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

function normalizeName(value: string) {
  return normalizeWhitespace(
    value
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[(){}[\],.:/\\+_-]+/g, ' ')
      .replace(/[^a-z0-9 ]+/g, ' '),
  );
}

function tokenize(value: string) {
  return normalizeName(value).split(' ').filter(Boolean);
}

function toBigrams(value: string) {
  const compact = value.replace(/\s+/g, '');
  if (compact.length < 2) return compact ? [compact] : [];
  const bigrams: string[] = [];
  for (let i = 0; i < compact.length - 1; i += 1) {
    bigrams.push(compact.slice(i, i + 2));
  }
  return bigrams;
}

function diceCoefficient(left: string, right: string) {
  if (!left || !right) return 0;
  if (left === right) return 1;

  const leftBigrams = toBigrams(left);
  const rightBigrams = toBigrams(right);
  if (leftBigrams.length === 0 || rightBigrams.length === 0) return 0;

  const rightCounts = new Map<string, number>();
  for (const bigram of rightBigrams) {
    rightCounts.set(bigram, (rightCounts.get(bigram) ?? 0) + 1);
  }

  let overlap = 0;
  for (const bigram of leftBigrams) {
    const remaining = rightCounts.get(bigram) ?? 0;
    if (remaining > 0) {
      overlap += 1;
      rightCounts.set(bigram, remaining - 1);
    }
  }

  return (2 * overlap) / (leftBigrams.length + rightBigrams.length);
}

function jaccardSimilarity(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const item of left) {
    if (right.has(item)) intersection += 1;
  }
  const union = left.size + right.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function compactCode(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function escapeCsv(value: string | number | boolean | null | undefined) {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function getDivisionImportRaw(metadata: unknown) {
  if (!isObjectRecord(metadata)) return null;
  const divisionImport = metadata.divisionImport;
  if (!isObjectRecord(divisionImport)) return null;
  const raw = divisionImport.raw;
  return isObjectRecord(raw) ? raw : null;
}

function extractFieldValue(raw: Record<string, unknown>, field: MappingField) {
  const value = getString(raw[field]);
  return value ? normalizeWhitespace(value) : '';
}

function scoreOrganizationGuess(
  sourceField: MappingField,
  importedValue: string,
  organization: OrganizationRow,
): MappingCandidate {
  const normalizedImported = normalizeName(importedValue);
  const normalizedOrgName = normalizeName(organization.name);
  const compactImported = compactCode(importedValue);
  const compactOrgCode = compactCode(organization.code);
  const importedTokens = new Set(tokenize(importedValue));
  const orgNameTokens = new Set(tokenize(organization.name));

  let score = 0;
  const rationale: string[] = [];

  if (normalizedImported === normalizedOrgName) {
    score += 0.96;
    rationale.push('Exact normalized name match');
  } else {
    const dice = diceCoefficient(normalizedImported, normalizedOrgName);
    const jaccard = jaccardSimilarity(importedTokens, orgNameTokens);
    score += dice * 0.42;
    score += jaccard * 0.28;
    if (dice >= 0.75) rationale.push(`High name similarity (${dice.toFixed(2)})`);
    if (jaccard >= 0.6) rationale.push(`Strong token overlap (${jaccard.toFixed(2)})`);
  }

  if (compactImported && compactOrgCode && compactImported === compactOrgCode) {
    score += 0.92;
    rationale.push('Exact compact code match');
  } else if (compactImported && compactOrgCode && compactImported.includes(compactOrgCode)) {
    score += 0.46;
    rationale.push('Imported value contains organization code');
  } else if (compactImported && compactOrgCode && compactOrgCode.includes(compactImported)) {
    score += 0.34;
    rationale.push('Organization code contains imported value');
  }

  if (normalizedImported && normalizedOrgName && normalizedImported.includes(normalizedOrgName)) {
    score += 0.18;
    rationale.push('Imported value contains organization name');
  } else if (normalizedImported && normalizedOrgName && normalizedOrgName.includes(normalizedImported)) {
    score += 0.14;
    rationale.push('Organization name contains imported value');
  }

  if (sourceField === 'Ministry/Sector Acronym') {
    if (compactImported && compactOrgCode && compactImported === compactOrgCode) {
      score += 0.2;
      rationale.push('Acronym field strongly matches organization code');
    }
  }

  return {
    organizationId: organization.id,
    organizationCode: organization.code,
    organizationName: organization.name,
    score: Number(Math.max(0, Math.min(1, score)).toFixed(4)),
    rationale: Array.from(new Set(rationale)),
  };
}

async function main() {
  const { csvOut, jsonOut, mdOut, sampleLimit } = parseArgs(process.argv);
  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  const csvPath = path.resolve(
    process.cwd(),
    csvOut ?? `${outputDirectory}/imported-system-org-mapping-${timestamp}.csv`,
  );
  const jsonPath = path.resolve(
    process.cwd(),
    jsonOut ?? `${outputDirectory}/imported-system-org-mapping-${timestamp}.json`,
  );
  const mdPath = path.resolve(process.cwd(), mdOut ?? `${outputDirectory}/imported-system-org-mapping-${timestamp}.md`);

  const [systems, organizations] = await Promise.all([
    prisma.system.findMany({
      where: {
        originKind: 'IMPORTED_OTHER',
        OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
      },
      select: {
        id: true,
        name: true,
        code: true,
        metadata: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.organization.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const importedSystems = systems.filter((system) => {
    const raw = getDivisionImportRaw(system.metadata);
    return !!raw;
  }) as ImportedSystemRow[];

  const fields: MappingField[] = ['Ministry/Sector Acronym'];

  const rows: MappingRow[] = [];

  for (const field of fields) {
    const systemsByValue = new Map<string, Array<{ id: string; name: string; code: string }>>();

    for (const system of importedSystems) {
      const raw = getDivisionImportRaw(system.metadata);
      if (!raw) continue;
      const value = extractFieldValue(raw, field);
      if (!value || value === '?' || value === '0') continue;

      const bucket = systemsByValue.get(value) ?? [];
      bucket.push({ id: system.id, name: system.name, code: system.code });
      systemsByValue.set(value, bucket);
    }

    for (const [importedValue, matchedSystems] of systemsByValue.entries()) {
      const guesses = organizations
        .map((organization) => scoreOrganizationGuess(field, importedValue, organization))
        .filter((candidate) => candidate.score > 0.12)
        .sort((left, right) => right.score - left.score || left.organizationName.localeCompare(right.organizationName));

      rows.push({
        sourceField: field,
        importedValue,
        importedSystemCount: matchedSystems.length,
        importedSystemsSample: matchedSystems.slice(0, sampleLimit),
        bestGuess: guesses[0] ?? null,
        alternateGuesses: guesses.slice(1, 4),
      });
    }
  }

  rows.sort(
    (left, right) =>
      left.sourceField.localeCompare(right.sourceField) ||
      right.importedSystemCount - left.importedSystemCount ||
      left.importedValue.localeCompare(right.importedValue),
  );

  const report = {
    ok: true,
    generatedAt: new Date().toISOString(),
    importedSystemCount: importedSystems.length,
    organizationCount: organizations.length,
    uniqueSourceValues: rows.length,
    mappings: rows,
  };

  const csv = [
    [
      'sourceField',
      'importedValue',
      'importedSystemCount',
      'importedSystemsSample',
      'bestGuessOrganizationId',
      'bestGuessOrganizationCode',
      'bestGuessOrganizationName',
      'bestGuessScore',
      'bestGuessRationale',
      'alternateGuesses',
    ].join(','),
    ...rows.map((row) =>
      [
        row.sourceField,
        row.importedValue,
        row.importedSystemCount,
        row.importedSystemsSample.map((system) => `${system.name} (${system.code})`).join(' | '),
        row.bestGuess?.organizationId ?? '',
        row.bestGuess?.organizationCode ?? '',
        row.bestGuess?.organizationName ?? '',
        row.bestGuess?.score ?? '',
        row.bestGuess?.rationale.join(' | ') ?? '',
        row.alternateGuesses
          .map((candidate) => `${candidate.organizationName} [${candidate.organizationCode}] ${candidate.score}`)
          .join(' | '),
      ]
        .map(escapeCsv)
        .join(','),
    ),
  ].join('\n');

  const markdownLines: string[] = [];
  markdownLines.push('# Imported System Organization Mapping Suggestions');
  markdownLines.push('');
  markdownLines.push(`Generated: ${report.generatedAt}`);
  markdownLines.push(`Imported systems scanned: ${report.importedSystemCount}`);
  markdownLines.push(`Organizations scanned: ${report.organizationCount}`);
  markdownLines.push(`Unique source values: ${report.uniqueSourceValues}`);
  markdownLines.push('');

  for (const field of fields) {
    const fieldRows = rows.filter((row) => row.sourceField === field);
    markdownLines.push(`## ${field}`);
    markdownLines.push('');
    if (fieldRows.length === 0) {
      markdownLines.push('No values found.');
      markdownLines.push('');
      continue;
    }

    for (const row of fieldRows) {
      markdownLines.push(`- ${row.importedValue}`);
      markdownLines.push(`  Systems: ${row.importedSystemCount}`);
      if (row.bestGuess) {
        markdownLines.push(
          `  Best guess: ${row.bestGuess.organizationName} (${row.bestGuess.organizationCode}) score ${row.bestGuess.score}`,
        );
      } else {
        markdownLines.push('  Best guess: none');
      }
      if (row.alternateGuesses.length > 0) {
        markdownLines.push(
          `  Alternates: ${row.alternateGuesses
            .map((candidate) => `${candidate.organizationName} (${candidate.organizationCode}) ${candidate.score}`)
            .join('; ')}`,
        );
      }
    }

    markdownLines.push('');
  }

  await Promise.all([
    mkdir(path.dirname(csvPath), { recursive: true }),
    mkdir(path.dirname(jsonPath), { recursive: true }),
    mkdir(path.dirname(mdPath), { recursive: true }),
  ]);

  await Promise.all([
    writeFile(csvPath, `${csv}\n`, 'utf8'),
    writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
    writeFile(mdPath, `${markdownLines.join('\n')}\n`, 'utf8'),
  ]);

  logger.info('suggest-organization-mappings-for-imported-systems completed', {
    importedSystemCount: report.importedSystemCount,
    organizationCount: report.organizationCount,
    uniqueSourceValues: report.uniqueSourceValues,
    outputs: {
      csvPath,
      jsonPath,
      mdPath,
    },
  });

  console.log(
    `Scanned ${report.importedSystemCount} imported Systems and ${report.organizationCount} Organizations. Wrote ${report.uniqueSourceValues} unique source-value mappings.`,
  );
  console.log(`Outputs:\n- ${csvPath}\n- ${jsonPath}\n- ${mdPath}`);
}

main().catch((error) => {
  logger.error('suggest-organization-mappings-for-imported-systems failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
