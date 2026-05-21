import { z } from 'zod';
import { logger } from '@/core/logging';
import prisma from './prisma';

const cliArgsSchema = z.object({
  limit: z.coerce.number().int().positive().default(10),
});

function parseArgs(argv: string[]) {
  const rawArgs = argv.slice(2);
  const args: Record<string, string> = {};

  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];
    const value = rawArgs[i + 1];
    if (!value) continue;

    if (token === '--limit') {
      args.limit = value;
      i += 1;
    }
  }

  return cliArgsSchema.parse(args);
}

type SummaryRow = {
  id: string;
  name: string;
  code: string;
  archived: boolean;
  originKind: string;
  clusterId: string | null;
  replacementId: string | null;
  replacementName: string | null;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function summarizeConsolidatedRecord(row: {
  id: string;
  name: string;
  code: string;
  archivedAt: Date | null;
  originKind: unknown;
  metadata: unknown;
}): SummaryRow {
  let clusterId: string | null = null;

  if (isObjectRecord(row.metadata) && isObjectRecord(row.metadata.consolidation)) {
    clusterId = getString(row.metadata.consolidation.clusterId);
  }

  return {
    id: row.id,
    name: row.name,
    code: row.code,
    archived: !!row.archivedAt,
    originKind: String(row.originKind),
    clusterId,
    replacementId: null,
    replacementName: null,
  };
}

function summarizeReplacedRecord(row: {
  id: string;
  name: string;
  code: string;
  archivedAt: Date | null;
  originKind: unknown;
  metadata: unknown;
}): SummaryRow {
  let replacementId: string | null = null;
  let replacementName: string | null = null;
  let clusterId: string | null = null;

  if (isObjectRecord(row.metadata) && isObjectRecord(row.metadata.consolidatedInto)) {
    const replacement = row.metadata.consolidatedInto;
    replacementId = getString(replacement.systemId) ?? getString(replacement.teamId);
    replacementName = getString(replacement.systemName) ?? getString(replacement.teamName);
    clusterId = getString(replacement.clusterId);
  }

  return {
    id: row.id,
    name: row.name,
    code: row.code,
    archived: !!row.archivedAt,
    originKind: String(row.originKind),
    clusterId,
    replacementId,
    replacementName,
  };
}

async function main() {
  const { limit } = parseArgs(process.argv);

  const [allSystems, allTeams] = await Promise.all([
    prisma.system.findMany({
      select: { id: true, name: true, code: true, archivedAt: true, originKind: true, metadata: true },
      orderBy: { name: 'asc' },
    }),
    prisma.team.findMany({
      select: { id: true, name: true, code: true, archivedAt: true, originKind: true, metadata: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const consolidatedSystems = allSystems.filter(
    (row) => isObjectRecord(row.metadata) && isObjectRecord(row.metadata.consolidation),
  );
  const replacedSystems = allSystems.filter(
    (row) => isObjectRecord(row.metadata) && isObjectRecord(row.metadata.consolidatedInto),
  );
  const consolidatedTeams = allTeams.filter(
    (row) => isObjectRecord(row.metadata) && isObjectRecord(row.metadata.consolidation),
  );
  const replacedTeams = allTeams.filter(
    (row) => isObjectRecord(row.metadata) && isObjectRecord(row.metadata.consolidatedInto),
  );

  const systemConsolidationCount = consolidatedSystems.length;
  const systemReplacementCount = replacedSystems.length;
  const teamConsolidationCount = consolidatedTeams.length;
  const teamReplacementCount = replacedTeams.length;

  const summary = {
    ok: true,
    limit,
    systems: {
      consolidatedCount: systemConsolidationCount,
      replacedCount: systemReplacementCount,
      consolidatedSamples: consolidatedSystems.slice(0, limit).map(summarizeConsolidatedRecord),
      replacedSamples: replacedSystems.slice(0, limit).map(summarizeReplacedRecord),
    },
    teams: {
      consolidatedCount: teamConsolidationCount,
      replacedCount: teamReplacementCount,
      consolidatedSamples: consolidatedTeams.slice(0, limit).map(summarizeConsolidatedRecord),
      replacedSamples: replacedTeams.slice(0, limit).map(summarizeReplacedRecord),
    },
  };

  logger.info('check-consolidation-metadata completed', summary);

  console.log(
    `Systems: ${systemConsolidationCount} consolidated, ${systemReplacementCount} replaced. Teams: ${teamConsolidationCount} consolidated, ${teamReplacementCount} replaced.`,
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  logger.error('check-consolidation-metadata failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
