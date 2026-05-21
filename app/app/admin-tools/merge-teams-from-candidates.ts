import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '@/core/logging';
import { EventType, Prisma, type PrismaClient, type Team } from '@/prisma/client';
import prisma from './prisma';

const clusterIdSchema = z.string().regex(/^cluster-\d{3}$/);
const clusterRangeSchema = z.string().regex(/^cluster-\d{3}:cluster-\d{3}$/);

const cliArgsSchema = z.object({
  input: z.string().min(1),
  clusterIds: z.array(clusterIdSchema).default([]),
  clusterRanges: z.array(clusterRangeSchema).default([]),
  minScore: z.coerce.number().min(0).max(1).optional(),
  dryRun: z.boolean().default(false),
});

const teamMemberSchema = z.object({
  userId: z.string().min(1),
  roles: z.array(z.string().min(1)).min(1),
});

const teamRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
});

const clusterSchema = z.object({
  clusterId: clusterIdSchema,
  nonCoreMemberScore: z.number(),
  suggestedCanonicalName: z.string().min(1),
  suggestedMembers: z.array(teamMemberSchema),
  teams: z.array(teamRefSchema).min(2),
});

const reportSchema = z.object({
  generatedAt: z.string().min(1),
  clusters: z.array(clusterSchema),
});

type ParsedArgs = z.infer<typeof cliArgsSchema>;
type CandidateCluster = z.infer<typeof clusterSchema>;

type LoadedSourceTeam = Team & {
  systemLinks: Array<{
    systemId: string;
    system: {
      id: string;
      name: string;
      code: string;
    };
  }>;
  privateCloudProductLinks: Array<{
    privateCloudProductId: string;
    privateCloudProduct: {
      id: string;
      licencePlate: string;
      name: string;
    };
  }>;
  publicCloudProductLinks: Array<{
    publicCloudProductId: string;
    publicCloudProduct: {
      id: string;
      licencePlate: string;
      name: string;
    };
  }>;
};

type ClusterSelection = {
  selectedClusterIds: string[];
  selectedClusters: CandidateCluster[];
};

type TeamCodeClient = {
  team: {
    findUnique: (args: { where: { code: string }; select: { id: true } }) => Promise<{ id: string } | null>;
  };
};

type TransactionCapableClient = Pick<PrismaClient, '$transaction'>;

type ClusterResult =
  | {
      ok: true;
      dryRun: boolean;
      clusterId: string;
      score: number;
      consolidatedTeam: {
        id?: string;
        name: string;
        code?: string;
      };
      sourceTeamIds: string[];
      movedSystemCount: number;
      movedPrivateCloudProductCount: number;
      movedPublicCloudProductCount: number;
      memberCount: number;
    }
  | {
      ok: false;
      dryRun: boolean;
      clusterId: string;
      score: number;
      error: string;
      sourceTeamIds: string[];
    };

function parseArgs(argv: string[]): ParsedArgs {
  const rawArgs = argv.slice(2);
  const input: Record<string, unknown> = {
    clusterIds: [],
    clusterRanges: [],
    dryRun: false,
  };

  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];

    if (token === '--dry-run') {
      input.dryRun = true;
      continue;
    }

    const value = rawArgs[i + 1];
    if (!value) continue;

    if (token === '--input') {
      input.input = value;
      i += 1;
      continue;
    }

    if (token === '--cluster-id') {
      (input.clusterIds as string[]).push(value);
      i += 1;
      continue;
    }

    if (token === '--cluster-range') {
      (input.clusterRanges as string[]).push(value);
      i += 1;
      continue;
    }

    if (token === '--min-score') {
      input.minScore = value;
      i += 1;
    }
  }

  return cliArgsSchema.parse(input);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function mergeJsonObject(baseValue: Prisma.JsonValue | null, addition: Record<string, unknown>): Prisma.InputJsonValue {
  if (isObjectRecord(baseValue)) {
    return {
      ...baseValue,
      ...addition,
    } as Prisma.InputJsonValue;
  }

  return {
    previousValue: baseValue,
    ...addition,
  } as Prisma.InputJsonValue;
}

function parseClusterNumber(clusterId: string) {
  return Number(clusterId.replace('cluster-', ''));
}

function selectClusters(report: z.infer<typeof reportSchema>, args: ParsedArgs): ClusterSelection {
  const clusterMap = new Map(report.clusters.map((cluster) => [cluster.clusterId, cluster]));
  const selectedIds = new Set<string>();

  for (const clusterId of args.clusterIds) {
    if (!clusterMap.has(clusterId)) {
      throw new Error(`Requested cluster id "${clusterId}" was not found in the input report.`);
    }
    selectedIds.add(clusterId);
  }

  for (const clusterRange of args.clusterRanges) {
    const [startId, endId] = clusterRange.split(':');
    if (!clusterMap.has(startId) || !clusterMap.has(endId)) {
      throw new Error(`Requested cluster range "${clusterRange}" references a cluster that was not found.`);
    }

    const startNumber = parseClusterNumber(startId);
    const endNumber = parseClusterNumber(endId);
    const [minNumber, maxNumber] = startNumber <= endNumber ? [startNumber, endNumber] : [endNumber, startNumber];

    for (const cluster of report.clusters) {
      const currentNumber = parseClusterNumber(cluster.clusterId);
      if (currentNumber >= minNumber && currentNumber <= maxNumber) {
        selectedIds.add(cluster.clusterId);
      }
    }
  }

  if (typeof args.minScore === 'number') {
    for (const cluster of report.clusters) {
      if (cluster.nonCoreMemberScore >= args.minScore) {
        selectedIds.add(cluster.clusterId);
      }
    }
  }

  if (selectedIds.size === 0) {
    throw new Error('No clusters were selected. Provide at least one cluster id, range, or min-score.');
  }

  const selectedClusters = report.clusters.filter((cluster) => selectedIds.has(cluster.clusterId));
  return {
    selectedClusterIds: selectedClusters.map((cluster) => cluster.clusterId),
    selectedClusters,
  };
}

async function loadSourceTeams(cluster: CandidateCluster): Promise<LoadedSourceTeam[]> {
  const sourceTeams = await prisma.team.findMany({
    where: {
      id: {
        in: cluster.teams.map((team) => team.id),
      },
    },
    include: {
      systemLinks: {
        include: {
          system: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      privateCloudProductLinks: {
        include: {
          privateCloudProduct: {
            select: {
              id: true,
              licencePlate: true,
              name: true,
            },
          },
        },
      },
      publicCloudProductLinks: {
        include: {
          publicCloudProduct: {
            select: {
              id: true,
              licencePlate: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (sourceTeams.length !== cluster.teams.length) {
    throw new Error('One or more Teams from the selected cluster no longer exist.');
  }

  const anyArchived = sourceTeams.some((team) => team.archivedAt);
  if (anyArchived) {
    throw new Error('At least one Team in this cluster is already archived. Skipping cluster as unsafe.');
  }

  return sourceTeams;
}

async function createAdminToolEvent(type: EventType, data: Prisma.InputJsonValue) {
  return prisma.event.create({
    data: {
      type,
      data,
    },
  });
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

    if (!existing) {
      return candidate;
    }
  }
}

function buildNewTeamMetadata(
  cluster: CandidateCluster,
  inputPath: string,
  generatedAt: string,
  sourceTeams: LoadedSourceTeam[],
  newTeam: { id?: string; code?: string; name: string },
) {
  return {
    consolidation: {
      createdAt: generatedAt,
      clusterId: cluster.clusterId,
      clusterScore: cluster.nonCoreMemberScore,
      inputFile: inputPath,
      suggestedCanonicalName: cluster.suggestedCanonicalName,
      consolidatedTeam: newTeam,
      sourceTeams: sourceTeams.map((team) => ({
        id: team.id,
        name: team.name,
        code: team.code,
        metadata: team.metadata,
        rules: team.rules,
        policies: team.policies,
        mappings: team.mappings,
      })),
    },
  } as Prisma.InputJsonValue;
}

async function processCluster(cluster: CandidateCluster, inputPath: string, dryRun: boolean): Promise<ClusterResult> {
  try {
    if (!cluster.suggestedCanonicalName?.trim()) {
      throw new Error('Cluster is missing suggestedCanonicalName.');
    }

    if (cluster.suggestedMembers.length === 0) {
      throw new Error('Cluster is missing suggestedMembers.');
    }

    const sourceTeams = await loadSourceTeams(cluster);
    const systemIds = Array.from(new Set(sourceTeams.flatMap((team) => team.systemLinks.map((link) => link.systemId))));
    const privateCloudProductIds = Array.from(
      new Set(sourceTeams.flatMap((team) => team.privateCloudProductLinks.map((link) => link.privateCloudProductId))),
    );
    const publicCloudProductIds = Array.from(
      new Set(sourceTeams.flatMap((team) => team.publicCloudProductLinks.map((link) => link.publicCloudProductId))),
    );
    const generatedAt = new Date().toISOString();

    if (dryRun) {
      const plannedCode = await generateUniqueTeamCode(prisma);
      return {
        ok: true,
        dryRun: true,
        clusterId: cluster.clusterId,
        score: cluster.nonCoreMemberScore,
        consolidatedTeam: {
          name: cluster.suggestedCanonicalName,
          code: plannedCode,
        },
        sourceTeamIds: sourceTeams.map((team) => team.id),
        movedSystemCount: systemIds.length,
        movedPrivateCloudProductCount: privateCloudProductIds.length,
        movedPublicCloudProductCount: publicCloudProductIds.length,
        memberCount: cluster.suggestedMembers.length,
      };
    }

    const transactionPrisma = prisma as unknown as TransactionCapableClient;
    const createdTeam = await transactionPrisma.$transaction(async (tx) => {
      const code = await generateUniqueTeamCode(tx);
      const metadata = buildNewTeamMetadata(cluster, inputPath, generatedAt, sourceTeams, {
        code,
        name: cluster.suggestedCanonicalName,
      });

      const created = await tx.team.create({
        data: {
          name: cluster.suggestedCanonicalName,
          code,
          metadata,
          rules: {
            generatedBy: 'admin-tool:merge-teams-from-candidates',
            clusterId: cluster.clusterId,
          } as Prisma.InputJsonValue,
          policies: {
            sourceOfTruth: 'team-cluster-consolidation',
            consolidationMode: 'admin-tool',
          } as Prisma.InputJsonValue,
          mappings: {
            sourceTeams: sourceTeams.map((team) => ({
              id: team.id,
              code: team.code,
              name: team.name,
            })),
            mergeCandidateReport: {
              inputFile: inputPath,
              clusterId: cluster.clusterId,
              score: cluster.nonCoreMemberScore,
            },
          } as Prisma.InputJsonValue,
          members: cluster.suggestedMembers,
        },
      });

      if (systemIds.length > 0) {
        await tx.systemTeamLink.createMany({
          data: systemIds.map((systemId) => ({
            teamId: created.id,
            systemId,
          })),
        });
      }

      if (privateCloudProductIds.length > 0) {
        await tx.teamPrivateCloudProductLink.createMany({
          data: privateCloudProductIds.map((privateCloudProductId) => ({
            teamId: created.id,
            privateCloudProductId,
          })),
        });
      }

      if (publicCloudProductIds.length > 0) {
        await tx.teamPublicCloudProductLink.createMany({
          data: publicCloudProductIds.map((publicCloudProductId) => ({
            teamId: created.id,
            publicCloudProductId,
          })),
        });
      }

      const sourceTeamIds = sourceTeams.map((team) => team.id);

      await tx.systemTeamLink.deleteMany({
        where: {
          teamId: {
            in: sourceTeamIds,
          },
        },
      });

      await tx.teamPrivateCloudProductLink.deleteMany({
        where: {
          teamId: {
            in: sourceTeamIds,
          },
        },
      });

      await tx.teamPublicCloudProductLink.deleteMany({
        where: {
          teamId: {
            in: sourceTeamIds,
          },
        },
      });

      for (const sourceTeam of sourceTeams) {
        await tx.team.update({
          where: { id: sourceTeam.id },
          data: {
            archivedAt: new Date(generatedAt),
            metadata: mergeJsonObject(sourceTeam.metadata, {
              consolidatedInto: {
                teamId: created.id,
                teamName: created.name,
                teamCode: created.code,
                clusterId: cluster.clusterId,
                inputFile: inputPath,
                consolidatedAt: generatedAt,
              },
            }),
          },
        });
      }

      return created;
    });

    await createAdminToolEvent(EventType.CREATE_TEAM, {
      id: createdTeam.id,
      data: {
        action: 'consolidate-team-cluster',
        clusterId: cluster.clusterId,
        clusterScore: cluster.nonCoreMemberScore,
        inputFile: inputPath,
        consolidatedTeam: {
          id: createdTeam.id,
          name: createdTeam.name,
          code: createdTeam.code,
        },
        sourceTeams: sourceTeams.map((team) => ({
          id: team.id,
          name: team.name,
          code: team.code,
        })),
      },
    } as Prisma.InputJsonValue);

    return {
      ok: true,
      dryRun: false,
      clusterId: cluster.clusterId,
      score: cluster.nonCoreMemberScore,
      consolidatedTeam: {
        id: createdTeam.id,
        name: createdTeam.name,
        code: createdTeam.code,
      },
      sourceTeamIds: sourceTeams.map((team) => team.id),
      movedSystemCount: systemIds.length,
      movedPrivateCloudProductCount: privateCloudProductIds.length,
      movedPublicCloudProductCount: publicCloudProductIds.length,
      memberCount: cluster.suggestedMembers.length,
    };
  } catch (error) {
    return {
      ok: false,
      dryRun,
      clusterId: cluster.clusterId,
      score: cluster.nonCoreMemberScore,
      error: error instanceof Error ? error.message : String(error),
      sourceTeamIds: cluster.teams.map((team) => team.id),
    };
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const inputPath = path.resolve(process.cwd(), args.input);
  const fileContents = await readFile(inputPath, 'utf8');
  const report = reportSchema.parse(JSON.parse(fileContents));
  const selection = selectClusters(report, args);
  const results: ClusterResult[] = [];

  for (const cluster of selection.selectedClusters) {
    const result = await processCluster(cluster, inputPath, args.dryRun);
    results.push(result);
  }

  const summary = {
    ok: true,
    dryRun: args.dryRun,
    inputFile: inputPath,
    selectedClusterIds: selection.selectedClusterIds,
    processed: results.length,
    merged: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    results,
  };

  logger.info('merge-teams-from-candidates completed', summary);
  console.log(
    `${summary.merged} team consolidations processed successfully from ${summary.processed} selected clusters. ${summary.failed} clusters failed.`,
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  logger.error('merge-teams-from-candidates failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
