import { z } from 'zod';
import { logger } from '@/core/logging';
import { EntityOriginKind } from '@/prisma/client';
import { deriveFallbackOriginKind } from '@/services/db/origin';
import prisma from './prisma';

const cliArgsSchema = z.object({
  systems: z.boolean().default(false),
  teams: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

type SummaryBucket = Record<EntityOriginKind, number>;

function createSummaryBucket(): SummaryBucket {
  return {
    [EntityOriginKind.MANUAL]: 0,
    [EntityOriginKind.BOOTSTRAPPED_FROM_PUBLIC_CLOUD_PRODUCT]: 0,
    [EntityOriginKind.BOOTSTRAPPED_FROM_PRIVATE_CLOUD_PRODUCT]: 0,
    [EntityOriginKind.CONSOLIDATED_FROM_SYSTEM_CLUSTER]: 0,
    [EntityOriginKind.CONSOLIDATED_FROM_TEAM_CLUSTER]: 0,
    [EntityOriginKind.IMPORTED_OTHER]: 0,
  };
}

function parseArgs(argv: string[]) {
  const rawArgs = argv.slice(2);
  const args: Record<string, boolean> = {};

  for (const token of rawArgs) {
    if (token === '--systems') args.systems = true;
    if (token === '--teams') args.teams = true;
    if (token === '--dry-run') args.dryRun = true;
  }

  const parsed = cliArgsSchema.parse(args);
  return {
    systems: parsed.systems || !parsed.teams,
    teams: parsed.teams || !parsed.systems,
    dryRun: parsed.dryRun,
  };
}

async function backfillSystems(dryRun: boolean) {
  const systems = await prisma.system.findMany({
    select: {
      id: true,
      name: true,
      originKind: true,
      metadata: true,
    },
    orderBy: { name: 'asc' },
  });

  const updates: Array<{
    id: string;
    name: string;
    from: EntityOriginKind;
    to: EntityOriginKind;
  }> = [];
  const targetCounts = createSummaryBucket();

  for (const system of systems) {
    const from = system.originKind ?? EntityOriginKind.MANUAL;
    const to = deriveFallbackOriginKind(system.metadata, 'system');
    if (from !== to) {
      updates.push({
        id: system.id,
        name: system.name,
        from,
        to,
      });
      targetCounts[to] += 1;
    }
  }

  if (!dryRun) {
    for (const update of updates) {
      await prisma.system.update({
        where: { id: update.id },
        data: { originKind: update.to },
      });
    }
  }

  return {
    scanned: systems.length,
    changed: updates.length,
    targetCounts,
    updates,
  };
}

async function backfillTeams(dryRun: boolean) {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      name: true,
      originKind: true,
      metadata: true,
    },
    orderBy: { name: 'asc' },
  });

  const updates: Array<{
    id: string;
    name: string;
    from: EntityOriginKind;
    to: EntityOriginKind;
  }> = [];
  const targetCounts = createSummaryBucket();

  for (const team of teams) {
    const from = team.originKind ?? EntityOriginKind.MANUAL;
    const to = deriveFallbackOriginKind(team.metadata, 'team');
    if (from !== to) {
      updates.push({
        id: team.id,
        name: team.name,
        from,
        to,
      });
      targetCounts[to] += 1;
    }
  }

  if (!dryRun) {
    for (const update of updates) {
      await prisma.team.update({
        where: { id: update.id },
        data: { originKind: update.to },
      });
    }
  }

  return {
    scanned: teams.length,
    changed: updates.length,
    targetCounts,
    updates,
  };
}

async function main() {
  const { systems, teams, dryRun } = parseArgs(process.argv);

  const summary = {
    ok: true,
    dryRun,
    systems: systems ? await backfillSystems(dryRun) : null,
    teams: teams ? await backfillTeams(dryRun) : null,
  };

  logger.info('backfill-origin-kind completed', summary);

  const systemSummary = summary.systems
    ? `${summary.systems.changed} of ${summary.systems.scanned} Systems`
    : '0 Systems';
  const teamSummary = summary.teams ? `${summary.teams.changed} of ${summary.teams.scanned} Teams` : '0 Teams';

  console.log(
    `${dryRun ? 'Dry run:' : 'Updated:'} ${systemSummary} and ${teamSummary} were assigned derived origin values.`,
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  logger.error('backfill-origin-kind failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
