import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { logger } from '@/core/logging';
import { EntityOriginKind, EventType, Prisma, SystemStatus } from '@/prisma/client';
import prisma from './prisma';

const cliArgsSchema = z.object({
  appsCsv: z.string().min(1).optional(),
  staffCsv: z.string().min(1).optional(),
  dryRun: z.boolean().default(false),
  systemsOnly: z.boolean().default(false),
  teamsOnly: z.boolean().default(false),
  jsonOut: z.string().min(1).optional(),
});

const defaultAppsCsv = 'app/admin-tools/input/division_apps.csv';
const defaultStaffCsv = 'app/admin-tools/input/division_staff.csv';
const defaultOutputDirectory = 'app/admin-tools/output';

type AppRow = {
  rowNumber: number;
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
  ministrySectorAcronym: string;
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

type ExistingSystemRecord = {
  id: string;
  name: string;
  code: string;
  archivedAt: Date | null;
  originKind: EntityOriginKind;
  metadata: Prisma.JsonValue | null;
  normalizedName: string;
  rootName: string;
};

type ExistingTeamRecord = {
  id: string;
  name: string;
  code: string;
  archivedAt: Date | null;
  originKind: EntityOriginKind;
  metadata: Prisma.JsonValue | null;
};

type UserRecord = {
  id: string;
  email: string;
  upn: string | null;
  firstName: string | null;
  lastName: string | null;
};

type SystemTarget = {
  id?: string;
  name: string;
  code?: string;
  sourceKey: string;
  mode: 'created' | 'existing-import' | 'reused-existing-name';
};

type SystemImportResult =
  | {
      ok: true;
      dryRun: boolean;
      sourceKey: string;
      uniqueId: string;
      appId: string;
      applicationName: string;
      disposition: 'created' | 'already-imported' | 'reused-existing-name';
      system: SystemTarget;
      notes: string[];
    }
  | {
      ok: false;
      dryRun: boolean;
      sourceKey: string;
      uniqueId: string;
      appId: string;
      applicationName: string;
      disposition: 'skipped-review';
      error: string;
      notes: string[];
    };

type TeamImportResult =
  | {
      ok: true;
      dryRun: boolean;
      assignmentId: string;
      disposition: 'created' | 'already-imported';
      team: {
        id?: string;
        name: string;
        code?: string;
      };
      linkedSystemCount: number;
      resolvedMemberCount: number;
      unresolvedMemberCount: number;
      notes: string[];
    }
  | {
      ok: false;
      dryRun: boolean;
      assignmentId: string;
      disposition: 'skipped-no-target-systems';
      error: string;
      notes: string[];
    };

type SystemCodeClient = {
  system: {
    findUnique: (args: { where: { code: string }; select: { id: true } }) => Promise<{ id: string } | null>;
  };
};
type TeamCodeClient = {
  team: {
    findUnique: (args: { where: { code: string }; select: { id: true } }) => Promise<{ id: string } | null>;
  };
};

function parseArgs(argv: string[]) {
  const rawArgs = argv.slice(2);
  const input: Record<string, unknown> = {
    dryRun: false,
    systemsOnly: false,
    teamsOnly: false,
  };

  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];

    if (token === '--dry-run') {
      input.dryRun = true;
      continue;
    }

    if (token === '--systems-only') {
      input.systemsOnly = true;
      continue;
    }

    if (token === '--teams-only') {
      input.teamsOnly = true;
      continue;
    }

    const value = rawArgs[i + 1];
    if (!value) continue;

    if (token === '--apps-csv') {
      input.appsCsv = value;
      i += 1;
      continue;
    }

    if (token === '--staff-csv') {
      input.staffCsv = value;
      i += 1;
      continue;
    }

    if (token === '--json-out') {
      input.jsonOut = value;
      i += 1;
    }
  }

  const parsed = cliArgsSchema.parse(input);
  return {
    ...parsed,
    runSystems: parsed.systemsOnly || !parsed.teamsOnly,
    runTeams: parsed.teamsOnly || !parsed.systemsOnly,
  };
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

function splitAssignmentIds(value: string) {
  const trimmed = normalizeWhitespace(value);
  if (!trimmed || trimmed === '#N/A' || trimmed === '0') return [];
  return trimmed
    .split(',')
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);
}

function buildAppSourceKey(app: AppRow) {
  return `division-app:${app.uniqueId}:${app.appId || `row-${app.rowNumber}`}`;
}

function buildTeamSourceKey(assignmentId: string) {
  return `division-staff:${assignmentId}`;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function readMetadataSourceKey(metadata: Prisma.JsonValue | null) {
  if (!isObjectRecord(metadata)) return null;

  const divisionImport = metadata.divisionImport;
  if (isObjectRecord(divisionImport) && typeof divisionImport.sourceKey === 'string') {
    return divisionImport.sourceKey;
  }

  const provenance = metadata.provenance;
  if (!isObjectRecord(provenance)) return null;
  const source = provenance.source;
  if (isObjectRecord(source) && typeof source.sourceKey === 'string') {
    return source.sourceKey;
  }

  return null;
}

function cleanEmployeeIdentifier(value: string) {
  const trimmed = normalizeWhitespace(value).replace(/^<|>$/g, '');
  return trimmed;
}

function joinDistinctParagraphs(parts: Array<string | null | undefined>) {
  const distinct = Array.from(new Set(parts.map((part) => normalizeWhitespace(part ?? '')).filter(Boolean)));
  return distinct.join('\n\n---\n\n');
}

function sanitizeLifecycleStage(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('eol') || normalized.includes('retired') || normalized.includes('archived')) {
    return SystemStatus.ARCHIVED;
  }
  return SystemStatus.ACTIVE;
}

function buildSystemDescription(app: AppRow) {
  return joinDistinctParagraphs([
    app.serviceName ? `Service: ${app.serviceName}` : '',
    app.applicationName ? `Application: ${app.applicationName}` : '',
    app.outcomesSummary ? `Outcomes Summary: ${app.outcomesSummary}` : '',
    app.notes ? `Notes: ${app.notes}` : '',
    app.notes2 ? `Additional Notes: ${app.notes2}` : '',
  ]);
}

function buildSuggestedTeamName(assignmentId: string, apps: AppRow[]) {
  if (apps.length === 1) return `${apps[0].applicationName} Team`;

  const distinctServiceNames = Array.from(new Set(apps.map((app) => app.serviceName).filter(Boolean)));
  if (distinctServiceNames.length === 1) return `${distinctServiceNames[0]} Team`;

  if (apps.length > 0) return `${apps[0].applicationName} Team`;

  return `${assignmentId} Team`;
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
      ministrySectorAcronym: normalizeWhitespace(row['Ministry/Sector Acronym'] ?? ''),
      raw: row,
    }),
  );
}

async function loadStaff(filePath: string) {
  const rows = await loadCsvRows(filePath);
  return rows.map((row, index): StaffRow => {
    const employeeEmail = cleanEmployeeIdentifier(row['Employee Team Member Email'] ?? '');
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
      standbyOrOtSchedule: normalizeWhitespace(row['Standby or OT Schedule'] ?? ''),
      category: normalizeWhitespace(row['Category'] ?? ''),
      frequency: normalizeWhitespace(row['Frequency'] ?? ''),
      raw: row,
    };
  });
}

async function loadExistingSystems() {
  const systems = await prisma.system.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      archivedAt: true,
      originKind: true,
      metadata: true,
    },
    orderBy: { name: 'asc' },
  });

  return systems.map(
    (system): ExistingSystemRecord => ({
      ...system,
      normalizedName: normalizeName(system.name),
      rootName: rootName(system.name),
    }),
  );
}

async function loadExistingTeams() {
  return prisma.team.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      archivedAt: true,
      originKind: true,
      metadata: true,
    },
    orderBy: { name: 'asc' },
  });
}

async function loadUsers() {
  return prisma.user.findMany({
    where: { archived: false },
    select: {
      id: true,
      email: true,
      upn: true,
      firstName: true,
      lastName: true,
    },
    orderBy: { email: 'asc' },
  });
}

function buildUserLookup(users: UserRecord[]) {
  const byEmail = new Map<string, UserRecord>();
  const names = new Map<string, UserRecord[]>();

  for (const user of users) {
    const emailKeys = [user.email, user.upn]
      .map((value) => normalizeWhitespace(value ?? '').toLowerCase())
      .filter(Boolean);
    for (const key of emailKeys) {
      if (!byEmail.has(key)) byEmail.set(key, user);
    }

    const fullName = normalizeWhitespace(`${user.firstName ?? ''} ${user.lastName ?? ''}`).toLowerCase();
    if (fullName) {
      const bucket = names.get(fullName) ?? [];
      bucket.push(user);
      names.set(fullName, bucket);
    }
  }

  return { byEmail, names };
}

function resolveStaffUser(staffRow: StaffRow, userLookup: ReturnType<typeof buildUserLookup>) {
  const candidate = cleanEmployeeIdentifier(staffRow.employeeEmail).toLowerCase();
  if (candidate.includes('@')) {
    const match = userLookup.byEmail.get(candidate);
    if (match) return { status: 'resolved' as const, user: match };
    return { status: 'unresolved' as const, reason: `No user found for email ${staffRow.employeeEmail}.` };
  }

  const normalizedName = cleanEmployeeIdentifier(staffRow.employeeEmail).toLowerCase();
  if (normalizedName) {
    const matches = userLookup.names.get(normalizedName) ?? [];
    if (matches.length === 1) {
      return { status: 'resolved' as const, user: matches[0] };
    }
    if (matches.length > 1) {
      return { status: 'unresolved' as const, reason: `Multiple users found for name ${staffRow.employeeEmail}.` };
    }
  }

  return { status: 'unresolved' as const, reason: `Could not resolve user for ${staffRow.employeeIdentifier}.` };
}

async function createAdminToolEvent(type: EventType, data: Prisma.InputJsonValue) {
  return prisma.event.create({
    data: {
      type,
      data,
    },
  });
}

async function generateUniqueSystemCode(client: SystemCodeClient) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

  for (;;) {
    const bytes = randomBytes(6);
    let candidate = '';
    for (let i = 0; i < 6; i += 1) {
      candidate += alphabet[bytes[i] % alphabet.length];
    }

    const existing = await client.system.findUnique({
      where: { code: candidate },
      select: { id: true },
    });

    if (!existing) return candidate;
  }
}

async function generateUniqueTeamCode(client: TeamCodeClient) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

  for (;;) {
    const bytes = randomBytes(6);
    let candidate = '';
    for (let i = 0; i < 6; i += 1) {
      candidate += alphabet[bytes[i] % alphabet.length];
    }

    const existing = await client.team.findUnique({
      where: { code: candidate },
      select: { id: true },
    });

    if (!existing) return candidate;
  }
}

async function importSystemFromAppRow({
  app,
  dryRun,
  existingSystems,
  appsCsvPath,
}: {
  app: AppRow;
  dryRun: boolean;
  existingSystems: ExistingSystemRecord[];
  appsCsvPath: string;
}): Promise<SystemImportResult> {
  const sourceKey = buildAppSourceKey(app);
  const notes: string[] = [];

  const existingImport = existingSystems.find((system) => readMetadataSourceKey(system.metadata) === sourceKey);
  if (existingImport) {
    return {
      ok: true,
      dryRun,
      sourceKey,
      uniqueId: app.uniqueId,
      appId: app.appId,
      applicationName: app.applicationName,
      disposition: 'already-imported',
      system: {
        id: existingImport.id,
        name: existingImport.name,
        code: existingImport.code,
        sourceKey,
        mode: 'existing-import',
      },
      notes,
    };
  }

  const exactActiveMatches = existingSystems.filter(
    (system) => !system.archivedAt && system.normalizedName === normalizeName(app.applicationName),
  );
  if (exactActiveMatches.length === 1) {
    const [match] = exactActiveMatches;
    notes.push('Reused existing active System based on exact normalized name match.');
    return {
      ok: true,
      dryRun,
      sourceKey,
      uniqueId: app.uniqueId,
      appId: app.appId,
      applicationName: app.applicationName,
      disposition: 'reused-existing-name',
      system: {
        id: match.id,
        name: match.name,
        code: match.code,
        sourceKey,
        mode: 'reused-existing-name',
      },
      notes,
    };
  }

  const rootTokenMatches = existingSystems.filter(
    (system) =>
      !system.archivedAt &&
      system.rootName &&
      rootName(app.applicationName) &&
      system.rootName === rootName(app.applicationName),
  );

  if (exactActiveMatches.length > 1 || rootTokenMatches.length > 0) {
    const matchNames = [...exactActiveMatches, ...rootTokenMatches].map((system) => system.name);
    return {
      ok: false,
      dryRun,
      sourceKey,
      uniqueId: app.uniqueId,
      appId: app.appId,
      applicationName: app.applicationName,
      disposition: 'skipped-review',
      error: `Potential existing System match requires review: ${Array.from(new Set(matchNames)).join(', ')}`,
      notes,
    };
  }

  if (dryRun) {
    return {
      ok: true,
      dryRun,
      sourceKey,
      uniqueId: app.uniqueId,
      appId: app.appId,
      applicationName: app.applicationName,
      disposition: 'created',
      system: {
        name: app.applicationName,
        sourceKey,
        mode: 'created',
      },
      notes,
    };
  }

  const code = await generateUniqueSystemCode(prisma);
  const created = await prisma.system.create({
    data: {
      name: app.applicationName,
      code,
      description: buildSystemDescription(app),
      status: sanitizeLifecycleStage(app.lifecycleStage),
      originKind: EntityOriginKind.IMPORTED_OTHER,
      metadata: {
        provenance: {
          importedFrom: 'division-app-csv',
          importedAt: new Date().toISOString(),
          source: {
            model: 'DivisionAppCsvRow',
            sourceKey,
            uniqueId: app.uniqueId,
            appId: app.appId,
            file: path.basename(appsCsvPath),
          },
        },
        divisionImport: {
          sourceKey,
          sourceType: 'division-app-csv',
          rowNumber: app.rowNumber,
          raw: app.raw,
        },
      } as Prisma.InputJsonValue,
      mappings: {
        divisionImport: {
          sourceKey,
          uniqueId: app.uniqueId,
          appId: app.appId,
        },
      } as Prisma.InputJsonValue,
      rules: {
        generatedBy: 'admin-tool:import-division-sources',
      } as Prisma.InputJsonValue,
      policies: {
        sourceOfTruth: 'division-app-import',
        importMode: 'admin-tool',
      } as Prisma.InputJsonValue,
      archivedAt: null,
    },
  });

  await createAdminToolEvent(EventType.CREATE_SYSTEM, {
    id: created.id,
    data: {
      name: created.name,
      code: created.code,
      importSource: {
        type: 'division-app-csv',
        sourceKey,
        uniqueId: app.uniqueId,
        appId: app.appId,
      },
    },
  } as Prisma.InputJsonValue);

  return {
    ok: true,
    dryRun,
    sourceKey,
    uniqueId: app.uniqueId,
    appId: app.appId,
    applicationName: app.applicationName,
    disposition: 'created',
    system: {
      id: created.id,
      name: created.name,
      code: created.code,
      sourceKey,
      mode: 'created',
    },
    notes,
  };
}

function findExistingSystemTargetForApp(app: AppRow, existingSystems: ExistingSystemRecord[]): SystemTarget | null {
  const sourceKey = buildAppSourceKey(app);
  const existingImport = existingSystems.find((system) => readMetadataSourceKey(system.metadata) === sourceKey);
  if (existingImport) {
    return {
      id: existingImport.id,
      name: existingImport.name,
      code: existingImport.code,
      sourceKey,
      mode: 'existing-import',
    };
  }

  const exactActiveMatches = existingSystems.filter(
    (system) => !system.archivedAt && system.normalizedName === normalizeName(app.applicationName),
  );

  if (exactActiveMatches.length === 1) {
    const [match] = exactActiveMatches;
    return {
      id: match.id,
      name: match.name,
      code: match.code,
      sourceKey,
      mode: 'reused-existing-name',
    };
  }

  return null;
}

function buildResolvedTeamMembers(rows: StaffRow[], userLookup: ReturnType<typeof buildUserLookup>) {
  const roleMap = new Map<string, Set<string>>();
  const unresolved: Array<{
    employeeIdentifier: string;
    assignmentRole: string;
    assignmentPercentage: string;
    reason: string;
  }> = [];

  for (const row of rows) {
    const resolved = resolveStaffUser(row, userLookup);
    if (resolved.status === 'resolved') {
      const existing = roleMap.get(resolved.user.id) ?? new Set<string>();
      existing.add(row.assignmentRole || 'Division Staff Member');
      roleMap.set(resolved.user.id, existing);
      continue;
    }

    unresolved.push({
      employeeIdentifier: row.employeeIdentifier,
      assignmentRole: row.assignmentRole,
      assignmentPercentage: row.assignmentPercentage,
      reason: resolved.reason,
    });
  }

  const members = Array.from(roleMap.entries())
    .map(([userId, roles]) => ({
      userId,
      roles: Array.from(roles).sort(),
    }))
    .sort((left, right) => left.userId.localeCompare(right.userId));

  return { members, unresolved };
}

async function importTeamFromAssignmentId({
  assignmentId,
  rows,
  targetSystems,
  dryRun,
  existingTeams,
  userLookup,
  sourceApps,
  staffCsvPath,
}: {
  assignmentId: string;
  rows: StaffRow[];
  targetSystems: SystemTarget[];
  dryRun: boolean;
  existingTeams: ExistingTeamRecord[];
  userLookup: ReturnType<typeof buildUserLookup>;
  sourceApps: AppRow[];
  staffCsvPath: string;
}): Promise<TeamImportResult> {
  const sourceKey = buildTeamSourceKey(assignmentId);
  const notes: string[] = [];

  if (targetSystems.length === 0) {
    return {
      ok: false,
      dryRun,
      assignmentId,
      disposition: 'skipped-no-target-systems',
      error: 'No target Systems were available for this assignment id.',
      notes,
    };
  }

  const { members, unresolved } = buildResolvedTeamMembers(rows, userLookup);
  const desiredName = buildSuggestedTeamName(assignmentId, sourceApps);
  const existingImport = existingTeams.find((team) => readMetadataSourceKey(team.metadata) === sourceKey);

  if (existingImport) {
    if (!dryRun) {
      for (const system of targetSystems) {
        if (!system.id) continue;
        const existingLink = await prisma.systemTeamLink.findFirst({
          where: {
            teamId: existingImport.id,
            systemId: system.id,
          },
        });
        if (!existingLink) {
          await prisma.systemTeamLink.create({
            data: {
              teamId: existingImport.id,
              systemId: system.id,
            },
          });
        }
      }
    }

    notes.push('Reused existing imported Team for this assignment id.');
    return {
      ok: true,
      dryRun,
      assignmentId,
      disposition: 'already-imported',
      team: {
        id: existingImport.id,
        name: existingImport.name,
        code: existingImport.code,
      },
      linkedSystemCount: targetSystems.length,
      resolvedMemberCount: members.length,
      unresolvedMemberCount: unresolved.length,
      notes,
    };
  }

  if (dryRun) {
    return {
      ok: true,
      dryRun,
      assignmentId,
      disposition: 'created',
      team: {
        name: desiredName,
      },
      linkedSystemCount: targetSystems.length,
      resolvedMemberCount: members.length,
      unresolvedMemberCount: unresolved.length,
      notes,
    };
  }

  const code = await generateUniqueTeamCode(prisma);
  const created = await prisma.team.create({
    data: {
      name: desiredName,
      code,
      description: `Imported from division_staff.csv for assignment ${assignmentId}.`,
      originKind: EntityOriginKind.IMPORTED_OTHER,
      metadata: {
        provenance: {
          importedFrom: 'division-staff-csv',
          importedAt: new Date().toISOString(),
          source: {
            model: 'DivisionStaffAssignment',
            sourceKey,
            assignmentId,
            file: path.basename(staffCsvPath),
          },
        },
        divisionImport: {
          sourceKey,
          sourceType: 'division-staff-csv',
          assignmentId,
          sourceApps: sourceApps.map((app) => ({
            sourceKey: buildAppSourceKey(app),
            uniqueId: app.uniqueId,
            appId: app.appId,
            applicationName: app.applicationName,
          })),
          unresolvedMembers: unresolved,
        },
      } as Prisma.InputJsonValue,
      mappings: {
        divisionImport: {
          sourceKey,
          assignmentId,
          sourceAppKeys: sourceApps.map(buildAppSourceKey),
        },
      } as Prisma.InputJsonValue,
      rules: {
        generatedBy: 'admin-tool:import-division-sources',
      } as Prisma.InputJsonValue,
      policies: {
        sourceOfTruth: 'division-staff-import',
        importMode: 'admin-tool',
      } as Prisma.InputJsonValue,
      members,
      archivedAt: null,
    },
  });

  try {
    for (const system of targetSystems) {
      if (!system.id) continue;
      await prisma.systemTeamLink.create({
        data: {
          teamId: created.id,
          systemId: system.id,
        },
      });
    }
  } catch (error) {
    await prisma.team.delete({ where: { id: created.id } });
    throw error;
  }

  await createAdminToolEvent(EventType.CREATE_TEAM, {
    id: created.id,
    data: {
      name: created.name,
      code: created.code,
      importSource: {
        type: 'division-staff-csv',
        sourceKey,
        assignmentId,
      },
      membersCount: members.length,
      linkedSystemCount: targetSystems.length,
    },
  } as Prisma.InputJsonValue);

  return {
    ok: true,
    dryRun,
    assignmentId,
    disposition: 'created',
    team: {
      id: created.id,
      name: created.name,
      code: created.code,
    },
    linkedSystemCount: targetSystems.length,
    resolvedMemberCount: members.length,
    unresolvedMemberCount: unresolved.length,
    notes,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  const jsonOut = args.jsonOut ?? `${defaultOutputDirectory}/division-import-run-${timestamp}.json`;

  const appsCsv = args.appsCsv ?? defaultAppsCsv;
  const staffCsv = args.staffCsv ?? defaultStaffCsv;

  const [apps, staffRows, existingSystems, existingTeams, users] = await Promise.all([
    loadApps(appsCsv),
    loadStaff(staffCsv),
    loadExistingSystems(),
    loadExistingTeams(),
    loadUsers(),
  ]);

  const userLookup = buildUserLookup(users);

  const appsByUniqueId = new Map<string, AppRow[]>();
  for (const app of apps) {
    const bucket = appsByUniqueId.get(app.uniqueId) ?? [];
    bucket.push(app);
    appsByUniqueId.set(app.uniqueId, bucket);
  }

  const staffRowsByAssignmentId = new Map<string, StaffRow[]>();
  for (const row of staffRows) {
    for (const assignmentId of row.assignmentIds) {
      const bucket = staffRowsByAssignmentId.get(assignmentId) ?? [];
      bucket.push(row);
      staffRowsByAssignmentId.set(assignmentId, bucket);
    }
  }

  const systemResults: SystemImportResult[] = [];
  const systemsBySourceKey = new Map<string, SystemTarget>();

  if (args.runSystems) {
    for (const app of apps) {
      const result = await importSystemFromAppRow({
        app,
        dryRun: args.dryRun,
        existingSystems,
        appsCsvPath: appsCsv,
      });
      systemResults.push(result);
      if (result.ok) {
        systemsBySourceKey.set(result.sourceKey, result.system);
      }
    }
  } else {
    for (const app of apps) {
      const target = findExistingSystemTargetForApp(app, existingSystems);
      if (target) {
        systemsBySourceKey.set(target.sourceKey, target);
      }
    }
  }

  const teamResults: TeamImportResult[] = [];

  if (args.runTeams) {
    for (const [assignmentId, rows] of Array.from(staffRowsByAssignmentId.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      const sourceApps = appsByUniqueId.get(assignmentId) ?? [];
      const targetSystems = Array.from(
        new Map(
          sourceApps
            .map((app) => systemsBySourceKey.get(buildAppSourceKey(app)))
            .filter((value): value is SystemTarget => !!value)
            .map((system) => [system.id ?? system.sourceKey, system]),
        ).values(),
      );

      const result = await importTeamFromAssignmentId({
        assignmentId,
        rows,
        targetSystems,
        dryRun: args.dryRun,
        existingTeams,
        userLookup,
        sourceApps,
        staffCsvPath: staffCsv,
      });

      teamResults.push(result);
    }
  }

  const summary = {
    ok: true,
    dryRun: args.dryRun,
    inputs: {
      appsCsv,
      staffCsv,
    },
    systems: {
      processed: args.runSystems ? apps.length : 0,
      created: systemResults.filter((result) => result.ok && result.disposition === 'created').length,
      alreadyImported: systemResults.filter((result) => result.ok && result.disposition === 'already-imported').length,
      reusedExistingName: systemResults.filter((result) => result.ok && result.disposition === 'reused-existing-name')
        .length,
      skippedReview: systemResults.filter((result) => !result.ok).length,
      results: systemResults,
    },
    teams: {
      processed: args.runTeams ? staffRowsByAssignmentId.size : 0,
      created: teamResults.filter((result) => result.ok && result.disposition === 'created').length,
      alreadyImported: teamResults.filter((result) => result.ok && result.disposition === 'already-imported').length,
      skippedNoTargetSystems: teamResults.filter((result) => !result.ok).length,
      results: teamResults,
    },
  };

  await mkdir(path.dirname(jsonOut), { recursive: true });
  await writeFile(jsonOut, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  logger.info('import-division-sources completed', {
    summary: {
      dryRun: summary.dryRun,
      systems: {
        processed: summary.systems.processed,
        created: summary.systems.created,
        alreadyImported: summary.systems.alreadyImported,
        reusedExistingName: summary.systems.reusedExistingName,
        skippedReview: summary.systems.skippedReview,
      },
      teams: {
        processed: summary.teams.processed,
        created: summary.teams.created,
        alreadyImported: summary.teams.alreadyImported,
        skippedNoTargetSystems: summary.teams.skippedNoTargetSystems,
      },
    },
    jsonOut,
  });

  console.log(
    `${args.dryRun ? 'Dry run:' : 'Completed:'} ${summary.systems.created} Systems created, ${
      summary.systems.alreadyImported
    } already imported, ${summary.systems.reusedExistingName} reused existing Systems, ${
      summary.systems.skippedReview
    } skipped for review.`,
  );
  console.log(
    `${args.dryRun ? 'Dry run:' : 'Completed:'} ${summary.teams.created} Teams created, ${
      summary.teams.alreadyImported
    } already imported, ${summary.teams.skippedNoTargetSystems} skipped due to missing target Systems.`,
  );
  console.log(`Run summary written to ${jsonOut}`);
}

main().catch((error) => {
  logger.error('import-division-sources failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
