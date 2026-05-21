import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { logger } from '@/core/logging';
import prisma from './prisma';

const cliArgsSchema = z.object({
  appsCsv: z.string().min(1).optional(),
  staffCsv: z.string().min(1).optional(),
  jsonOut: z.string().min(1).optional(),
  mdOut: z.string().min(1).optional(),
  csvOut: z.string().min(1).optional(),
});

const defaultAppsCsv = 'app/admin-tools/input/division_apps.csv';
const defaultStaffCsv = 'app/admin-tools/input/division_staff.csv';
const outputDirectory = 'app/admin-tools/output';

type AppRow = {
  rowNumber: number;
  ministrySectorAcronym: string;
  uniqueId: string;
  appId: string;
  serviceName: string;
  applicationName: string;
  hostingEnvironment: string;
  lifecycleStage: string;
  criticality: string;
  programAreasServiced: string;
  keyProgramContacts: string;
  outcomesSummary: string;
  notes: string;
  notes2: string;
  newDivision: string;
  raw: Record<string, string>;
};

type StaffRow = {
  rowNumber: number;
  employeeIdentifier: string;
  employeeEmail: string;
  employeeNumber: string;
  assignmentRole: string;
  assignmentPercentage: string;
  assignmentIds: string[];
  employeeClassification: string;
  standbyOrOtSchedule: string;
  category: string;
  frequency: string;
  raw: Record<string, string>;
};

type ExistingSystem = {
  id: string;
  name: string;
  code: string;
  originKind: string;
  rootName: string;
  normalizedName: string;
};

type CandidateSystemMatch = {
  id: string;
  name: string;
  code: string;
  originKind: string;
};

type ProposedSystemImport = {
  sourceKey: string;
  uniqueId: string;
  appId: string;
  applicationName: string;
  serviceName: string;
  newDivision: string;
  staffAssignmentCount: number;
  staffMemberCount: number;
  appUniqueIdDuplicateCount: number;
  exactExistingMatches: CandidateSystemMatch[];
  rootTokenMatches: CandidateSystemMatch[];
  importDisposition: 'create-new' | 'review-existing' | 'ambiguous-app-source';
  notes: string[];
};

type ProposedTeamImport = {
  assignmentId: string;
  teamName: string;
  staffRowCount: number;
  distinctMemberCount: number;
  matchedAppCount: number;
  matchedSystemCount: number;
  matchedSourceKeys: string[];
  matchedApplicationNames: string[];
  topRoles: string[];
  issues: string[];
};

function parseArgs(argv: string[]) {
  const rawArgs = argv.slice(2);
  const args: Record<string, string> = {};

  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];
    const value = rawArgs[i + 1];
    if (!value) continue;

    if (token === '--apps-csv') {
      args.appsCsv = value;
      i += 1;
      continue;
    }

    if (token === '--staff-csv') {
      args.staffCsv = value;
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

    if (token === '--csv-out') {
      args.csvOut = value;
      i += 1;
    }
  }

  return cliArgsSchema.parse(args);
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

function rootName(value: string) {
  return normalizeName(value)
    .split(' ')
    .filter(Boolean)
    .filter(
      (token) =>
        !new Set(['team', 'teams', 'system', 'systems', 'service', 'services', 'app', 'application']).has(token),
    )
    .join(' ');
}

function escapeCsv(value: string | number | boolean | null | undefined) {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function splitAssignmentIds(value: string) {
  const trimmed = normalizeWhitespace(value);
  if (!trimmed || trimmed === '#N/A' || trimmed === '0') return [];
  return trimmed
    .split(',')
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);
}

function buildSourceKey(app: AppRow) {
  return `${app.uniqueId}::${app.appId || `row-${app.rowNumber}`}`;
}

async function loadCsvRows(filePath: string) {
  const fileContents = await readFile(filePath, 'utf8');
  return parse(fileContents, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];
}

async function loadApps(filePath: string) {
  const rows = await loadCsvRows(filePath);
  return rows.map(
    (row, index): AppRow => ({
      rowNumber: index + 2,
      ministrySectorAcronym: normalizeWhitespace(row['Ministry/Sector Acronym'] ?? ''),
      uniqueId: normalizeWhitespace(row['Unique ID'] ?? ''),
      appId: normalizeWhitespace(row['App ID'] ?? ''),
      serviceName: normalizeWhitespace(row['Service Name'] ?? ''),
      applicationName: normalizeWhitespace(row['Application Name'] ?? ''),
      hostingEnvironment: normalizeWhitespace(row['Hosting Environment'] ?? ''),
      lifecycleStage: normalizeWhitespace(row['Lifecycle Stage'] ?? ''),
      criticality: normalizeWhitespace(row['Criticality'] ?? ''),
      programAreasServiced: normalizeWhitespace(row['Program areas serviced'] ?? ''),
      keyProgramContacts: normalizeWhitespace(row['Key program area contact(s)'] ?? ''),
      outcomesSummary: normalizeWhitespace(row['Outcomes Summary'] ?? ''),
      notes: normalizeWhitespace(row['NOTES'] ?? ''),
      notes2: normalizeWhitespace(row['Notes2'] ?? ''),
      newDivision: normalizeWhitespace(row['New Division'] ?? ''),
      raw: row,
    }),
  );
}

async function loadStaff(filePath: string) {
  const rows = await loadCsvRows(filePath);
  return rows.map((row, index): StaffRow => {
    const employeeEmail = normalizeWhitespace(row['Employee Team Member Email'] ?? '');
    const employeeNumber = normalizeWhitespace(row['Employee Number'] ?? '');

    return {
      rowNumber: index + 2,
      employeeIdentifier: employeeEmail || employeeNumber || `row-${index + 2}`,
      employeeEmail,
      employeeNumber,
      assignmentRole: normalizeWhitespace(row['Assignment Role'] ?? ''),
      assignmentPercentage: normalizeWhitespace(row['Assignment #1 Percentage'] ?? ''),
      assignmentIds: splitAssignmentIds(row['Ass1 UniqueID'] ?? ''),
      employeeClassification: normalizeWhitespace(row['Employee Classification'] ?? ''),
      standbyOrOtSchedule: normalizeWhitespace(row['Standby or OT Schedule'] ?? ''), // codespell:ignore

      category: normalizeWhitespace(row['Category'] ?? ''),
      frequency: normalizeWhitespace(row['Frequency'] ?? ''),
      raw: row,
    };
  });
}

async function loadExistingSystems() {
  const systems = await prisma.system.findMany({
    where: {
      OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
    },
    select: {
      id: true,
      name: true,
      code: true,
      originKind: true,
    },
    orderBy: { name: 'asc' },
  });

  return systems.map(
    (system): ExistingSystem => ({
      id: system.id,
      name: system.name,
      code: system.code,
      originKind: String(system.originKind),
      normalizedName: normalizeName(system.name),
      rootName: rootName(system.name),
    }),
  );
}

function systemMatchView(system: ExistingSystem): CandidateSystemMatch {
  return {
    id: system.id,
    name: system.name,
    code: system.code,
    originKind: system.originKind,
  };
}

function buildSuggestedTeamName(apps: AppRow[], assignmentId: string) {
  if (apps.length === 1) return `${apps[0].applicationName} Team`;
  if (apps.length > 1) {
    const commonServiceName = Array.from(new Set(apps.map((app) => app.serviceName).filter(Boolean)));
    if (commonServiceName.length === 1) {
      return `${commonServiceName[0]} Team`;
    }
    return `${apps[0].applicationName} Team`;
  }
  return `${assignmentId} Team`;
}

async function main() {
  const parsedArgs = parseArgs(process.argv);
  const appsCsv = parsedArgs.appsCsv ?? defaultAppsCsv;
  const staffCsv = parsedArgs.staffCsv ?? defaultStaffCsv;
  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  const jsonOut = parsedArgs.jsonOut ?? `${outputDirectory}/division-import-analysis-${timestamp}.json`;
  const mdOut = parsedArgs.mdOut ?? `${outputDirectory}/division-import-analysis-${timestamp}.md`;
  const csvOut = parsedArgs.csvOut ?? `${outputDirectory}/division-system-import-review-${timestamp}.csv`;

  const [apps, staffRows, existingSystems] = await Promise.all([
    loadApps(appsCsv),
    loadStaff(staffCsv),
    loadExistingSystems(),
  ]);

  const appsByUniqueId = new Map<string, AppRow[]>();
  for (const app of apps) {
    const bucket = appsByUniqueId.get(app.uniqueId) ?? [];
    bucket.push(app);
    appsByUniqueId.set(app.uniqueId, bucket);
  }

  const staffRowsByAssignmentId = new Map<string, StaffRow[]>();
  const unmatchedStaffRows: StaffRow[] = [];
  for (const row of staffRows) {
    if (row.assignmentIds.length === 0) {
      unmatchedStaffRows.push(row);
      continue;
    }
    for (const assignmentId of row.assignmentIds) {
      const bucket = staffRowsByAssignmentId.get(assignmentId) ?? [];
      bucket.push(row);
      staffRowsByAssignmentId.set(assignmentId, bucket);
    }
  }

  const proposedSystems: ProposedSystemImport[] = apps.map((app) => {
    const assignmentRows = staffRowsByAssignmentId.get(app.uniqueId) ?? [];
    const distinctMembers = new Set(assignmentRows.map((row) => row.employeeIdentifier));
    const exactExistingMatches = existingSystems
      .filter((system) => system.normalizedName === normalizeName(app.applicationName))
      .map(systemMatchView);
    const rootTokenMatches = existingSystems
      .filter((system) => system.rootName && system.rootName === rootName(app.applicationName))
      .map(systemMatchView)
      .filter((match) => !exactExistingMatches.some((exact) => exact.id === match.id));

    const notes: string[] = [];
    let importDisposition: ProposedSystemImport['importDisposition'] = 'create-new';
    const appUniqueIdDuplicateCount = (appsByUniqueId.get(app.uniqueId) ?? []).length;
    if (appUniqueIdDuplicateCount > 1) {
      importDisposition = 'ambiguous-app-source';
      notes.push(`Unique ID ${app.uniqueId} appears on ${appUniqueIdDuplicateCount} app rows.`);
    } else if (exactExistingMatches.length > 0 || rootTokenMatches.length > 0) {
      importDisposition = 'review-existing';
      notes.push('Potential existing System match found in registry.');
    }

    return {
      sourceKey: buildSourceKey(app),
      uniqueId: app.uniqueId,
      appId: app.appId,
      applicationName: app.applicationName,
      serviceName: app.serviceName,
      newDivision: app.newDivision,
      staffAssignmentCount: assignmentRows.length,
      staffMemberCount: distinctMembers.size,
      appUniqueIdDuplicateCount,
      exactExistingMatches,
      rootTokenMatches,
      importDisposition,
      notes,
    };
  });

  const proposedTeams: ProposedTeamImport[] = Array.from(staffRowsByAssignmentId.entries())
    .map(([assignmentId, rows]) => {
      const matchingApps = appsByUniqueId.get(assignmentId) ?? [];
      const matchedSourceKeys = matchingApps.map(buildSourceKey);
      const matchedApplicationNames = matchingApps.map((app) => app.applicationName);
      const topRoles = Array.from(
        rows.reduce((counts, row) => {
          if (row.assignmentRole) {
            counts.set(row.assignmentRole, (counts.get(row.assignmentRole) ?? 0) + 1);
          }
          return counts;
        }, new Map<string, number>()),
      )
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .slice(0, 5)
        .map(([role]) => role);

      const issues: string[] = [];
      if (matchingApps.length === 0) issues.push('No matching app row found.');
      if (matchingApps.length > 1) issues.push(`Assignment ID maps to ${matchingApps.length} app rows.`);

      return {
        assignmentId,
        teamName: buildSuggestedTeamName(matchingApps, assignmentId),
        staffRowCount: rows.length,
        distinctMemberCount: new Set(rows.map((row) => row.employeeIdentifier)).size,
        matchedAppCount: matchingApps.length,
        matchedSystemCount: matchingApps.length,
        matchedSourceKeys,
        matchedApplicationNames,
        topRoles,
        issues,
      };
    })
    .sort((left, right) => left.assignmentId.localeCompare(right.assignmentId));

  const exactSystemMatchCount = proposedSystems.filter((system) => system.exactExistingMatches.length > 0).length;
  const rootTokenSystemMatchCount = proposedSystems.filter((system) => system.rootTokenMatches.length > 0).length;
  const ambiguousAppCount = proposedSystems.filter(
    (system) => system.importDisposition === 'ambiguous-app-source',
  ).length;
  const unmatchedTeamCount = proposedTeams.filter((team) => team.matchedAppCount === 0).length;
  const ambiguousTeamCount = proposedTeams.filter((team) => team.matchedAppCount > 1).length;

  const report = {
    ok: true,
    generatedAt: new Date().toISOString(),
    inputs: {
      appsCsv,
      staffCsv,
    },
    summary: {
      appsRows: apps.length,
      staffRows: staffRows.length,
      existingSystems: existingSystems.length,
      distinctAppUniqueIds: appsByUniqueId.size,
      distinctStaffAssignmentIds: staffRowsByAssignmentId.size,
      unmatchedStaffRows: unmatchedStaffRows.length,
      proposedSystemImports: proposedSystems.length,
      proposedTeamImports: proposedTeams.length,
      systemsNeedingExistingReview: exactSystemMatchCount + rootTokenSystemMatchCount,
      systemsWithDuplicateUniqueId: ambiguousAppCount,
      teamsWithoutAppMatch: unmatchedTeamCount,
      teamsWithAmbiguousAppMatch: ambiguousTeamCount,
    },
    proposedSystems,
    proposedTeams,
    unmatchedStaffRows: unmatchedStaffRows.slice(0, 250).map((row) => ({
      rowNumber: row.rowNumber,
      employeeIdentifier: row.employeeIdentifier,
      assignmentRole: row.assignmentRole,
      assignmentIds: row.assignmentIds,
      category: row.category,
      frequency: row.frequency,
    })),
  };

  const markdown = `# Division Import Analysis

Generated: ${report.generatedAt}

## Inputs

- Apps CSV: \`${appsCsv}\`
- Staff CSV: \`${staffCsv}\`

## Summary

- App rows: ${report.summary.appsRows}
- Staff rows: ${report.summary.staffRows}
- Existing Systems in registry: ${report.summary.existingSystems}
- Distinct app Unique IDs: ${report.summary.distinctAppUniqueIds}
- Distinct staff assignment IDs: ${report.summary.distinctStaffAssignmentIds}
- Unmatched staff rows: ${report.summary.unmatchedStaffRows}
- Proposed System imports: ${report.summary.proposedSystemImports}
- Proposed Team imports: ${report.summary.proposedTeamImports}
- Systems needing existing-registry review: ${report.summary.systemsNeedingExistingReview}
- Systems with duplicate app Unique IDs: ${report.summary.systemsWithDuplicateUniqueId}
- Teams without app match: ${report.summary.teamsWithoutAppMatch}
- Teams with ambiguous app match: ${report.summary.teamsWithAmbiguousAppMatch}

## Mapping Approach

### Systems

- One proposed \`System\` per app row in \`division_apps.csv\`
- Use app \`Application Name\` as the primary source for the System name
- Preserve the full source row and provenance in metadata
- Treat \`Unique ID\` + \`App ID\` as the stable source key for import

### Teams

- One proposed \`Team\` per normalized staff assignment target in \`division_staff.csv\`
- Correlate staff assignments to apps using:
  - staff \`Ass1 UniqueID\`
  - app \`Unique ID\`
- Derive Team names from the matched app where possible
- Preserve the original assignment role data as imported team-member role information

## Systems Requiring Review

${proposedSystems
  .filter((system) => system.importDisposition !== 'create-new')
  .slice(0, 50)
  .map((system) => {
    const exact = system.exactExistingMatches.map((match) => match.name).join(', ') || 'none';
    const root = system.rootTokenMatches.map((match) => match.name).join(', ') || 'none';
    return `- ${system.applicationName} (\`${system.sourceKey}\`): disposition=\`${system.importDisposition}\`, exact matches=${exact}, root-token matches=${root}`;
  })
  .join('\n')}

## Teams Requiring Review

${proposedTeams
  .filter((team) => team.issues.length > 0)
  .slice(0, 50)
  .map(
    (team) =>
      `- ${team.teamName} (\`${team.assignmentId}\`): ${team.issues.join('; ') || 'none'} | apps=${
        team.matchedApplicationNames.join(', ') || 'none'
      }`,
  )
  .join('\n')}
`;

  const csv = [
    [
      'sourceKey',
      'uniqueId',
      'appId',
      'applicationName',
      'serviceName',
      'newDivision',
      'staffAssignmentCount',
      'staffMemberCount',
      'appUniqueIdDuplicateCount',
      'importDisposition',
      'exactExistingMatches',
      'rootTokenMatches',
      'notes',
    ].join(','),
    ...proposedSystems.map((system) =>
      [
        system.sourceKey,
        system.uniqueId,
        system.appId,
        system.applicationName,
        system.serviceName,
        system.newDivision,
        system.staffAssignmentCount,
        system.staffMemberCount,
        system.appUniqueIdDuplicateCount,
        system.importDisposition,
        system.exactExistingMatches.map((match) => match.name).join(' | '),
        system.rootTokenMatches.map((match) => match.name).join(' | '),
        system.notes.join(' | '),
      ]
        .map(escapeCsv)
        .join(','),
    ),
  ].join('\n');

  await Promise.all([
    mkdir(path.dirname(jsonOut), { recursive: true }),
    mkdir(path.dirname(mdOut), { recursive: true }),
    mkdir(path.dirname(csvOut), { recursive: true }),
  ]);

  await Promise.all([
    writeFile(jsonOut, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
    writeFile(mdOut, markdown, 'utf8'),
    writeFile(csvOut, csv, 'utf8'),
  ]);

  logger.info('analyze-division-import-sources completed', {
    summary: report.summary,
    outputs: { jsonOut, mdOut, csvOut },
  });

  console.log(
    `Analyzed ${report.summary.appsRows} app rows and ${report.summary.staffRows} staff rows. Proposed ${report.summary.proposedSystemImports} System imports and ${report.summary.proposedTeamImports} Team imports.`,
  );
  console.log(`Review outputs written to:\n- ${jsonOut}\n- ${mdOut}\n- ${csvOut}`);
}

main().catch((error) => {
  logger.error('analyze-division-import-sources failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
