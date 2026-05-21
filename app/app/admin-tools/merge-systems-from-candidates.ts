import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '@/core/logging';
import { EventType, Prisma, SystemStatus, type PrismaClient, type Organization, type System } from '@/prisma/client';
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

const systemRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  organization: z
    .object({
      id: z.string().min(1),
      code: z.string().min(1),
      name: z.string().min(1),
    })
    .nullable(),
});

const clusterSchema = z.object({
  clusterId: clusterIdSchema,
  score: z.number(),
  suggestedCanonicalSystemId: z.string().min(1),
  suggestedCanonicalName: z.string().min(1),
  systems: z.array(systemRefSchema).min(2),
});

const reportSchema = z.object({
  generatedAt: z.string().min(1),
  clusters: z.array(clusterSchema),
});

type ParsedArgs = z.infer<typeof cliArgsSchema>;
type CandidateCluster = z.infer<typeof clusterSchema>;

type LoadedSourceSystem = System & {
  organization: Pick<Organization, 'id' | 'code' | 'name'> | null;
  teamLinks: Array<{
    teamId: string;
    team: {
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

type TransactionCapableClient = Pick<PrismaClient, '$transaction'>;

type SystemCodeClient = {
  system: {
    findUnique: (args: { where: { code: string }; select: { id: true } }) => Promise<{ id: string } | null>;
  };
};

type ClusterResult =
  | {
      ok: true;
      dryRun: boolean;
      clusterId: string;
      score: number;
      consolidatedSystem: {
        id?: string;
        name: string;
        code?: string;
      };
      sourceSystemIds: string[];
      movedTeamCount: number;
      movedPrivateCloudProductCount: number;
      movedPublicCloudProductCount: number;
    }
  | {
      ok: false;
      dryRun: boolean;
      clusterId: string;
      score: number;
      error: string;
      sourceSystemIds: string[];
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

function getDistinctNonEmptyDescriptions(systems: LoadedSourceSystem[]) {
  return Array.from(
    new Set(
      systems.map((system) => system.description?.trim()).filter((description): description is string => !!description),
    ),
  );
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
      if (cluster.score >= args.minScore) {
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

async function loadSourceSystems(cluster: CandidateCluster): Promise<LoadedSourceSystem[]> {
  const sourceSystems = await prisma.system.findMany({
    where: {
      id: {
        in: cluster.systems.map((system) => system.id),
      },
    },
    include: {
      organization: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      teamLinks: {
        include: {
          team: {
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

  if (sourceSystems.length !== cluster.systems.length) {
    throw new Error('One or more Systems from the selected cluster no longer exist.');
  }

  const anyArchived = sourceSystems.some((system) => system.archivedAt || system.status === SystemStatus.ARCHIVED);
  if (anyArchived) {
    throw new Error('At least one System in this cluster is already archived. Skipping cluster as unsafe.');
  }

  const organizationIds = new Set(sourceSystems.map((system) => system.organizationId));
  if (organizationIds.size !== 1) {
    throw new Error('Selected cluster Systems no longer share the same organization.');
  }

  return sourceSystems;
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

    if (!existing) {
      return candidate;
    }
  }
}

function buildNewSystemMetadata(
  cluster: CandidateCluster,
  inputPath: string,
  generatedAt: string,
  sourceSystems: LoadedSourceSystem[],
  newSystem: { id?: string; code?: string; name: string },
) {
  return {
    consolidation: {
      createdAt: generatedAt,
      clusterId: cluster.clusterId,
      clusterScore: cluster.score,
      inputFile: inputPath,
      suggestedCanonicalSystemId: cluster.suggestedCanonicalSystemId,
      suggestedCanonicalName: cluster.suggestedCanonicalName,
      consolidatedSystem: newSystem,
      sourceSystems: sourceSystems.map((system) => ({
        id: system.id,
        name: system.name,
        code: system.code,
        organizationId: system.organizationId,
        metadata: system.metadata,
        rules: system.rules,
        policies: system.policies,
        mappings: system.mappings,
      })),
    },
  } as Prisma.InputJsonValue;
}

async function processCluster(cluster: CandidateCluster, inputPath: string, dryRun: boolean): Promise<ClusterResult> {
  try {
    if (!cluster.suggestedCanonicalName?.trim()) {
      throw new Error('Cluster is missing suggestedCanonicalName.');
    }

    const sourceSystems = await loadSourceSystems(cluster);
    const description = getDistinctNonEmptyDescriptions(sourceSystems).join('\n\n---\n\n') || null;
    const teamIds = Array.from(new Set(sourceSystems.flatMap((system) => system.teamLinks.map((link) => link.teamId))));
    const privateCloudProductIds = Array.from(
      new Set(
        sourceSystems.flatMap((system) => system.privateCloudProductLinks.map((link) => link.privateCloudProductId)),
      ),
    );
    const publicCloudProductIds = Array.from(
      new Set(
        sourceSystems.flatMap((system) => system.publicCloudProductLinks.map((link) => link.publicCloudProductId)),
      ),
    );
    const generatedAt = new Date().toISOString();

    if (dryRun) {
      const plannedCode = await generateUniqueSystemCode(prisma);
      return {
        ok: true,
        dryRun: true,
        clusterId: cluster.clusterId,
        score: cluster.score,
        consolidatedSystem: {
          name: cluster.suggestedCanonicalName,
          code: plannedCode,
        },
        sourceSystemIds: sourceSystems.map((system) => system.id),
        movedTeamCount: teamIds.length,
        movedPrivateCloudProductCount: privateCloudProductIds.length,
        movedPublicCloudProductCount: publicCloudProductIds.length,
      };
    }

    const transactionPrisma = prisma as unknown as TransactionCapableClient;
    const createdSystem = await transactionPrisma.$transaction(async (tx) => {
      const code = await generateUniqueSystemCode(tx);
      const metadata = buildNewSystemMetadata(cluster, inputPath, generatedAt, sourceSystems, {
        code,
        name: cluster.suggestedCanonicalName,
      });

      const created = await tx.system.create({
        data: {
          name: cluster.suggestedCanonicalName,
          code,
          description,
          status: SystemStatus.ACTIVE,
          organizationId: sourceSystems[0].organizationId,
          metadata,
          rules: {
            generatedBy: 'admin-tool:merge-systems-from-candidates',
            clusterId: cluster.clusterId,
          } as Prisma.InputJsonValue,
          policies: {
            sourceOfTruth: 'system-cluster-consolidation',
            consolidationMode: 'admin-tool',
          } as Prisma.InputJsonValue,
          mappings: {
            sourceSystems: sourceSystems.map((system) => ({
              id: system.id,
              code: system.code,
              name: system.name,
            })),
            mergeCandidateReport: {
              inputFile: inputPath,
              clusterId: cluster.clusterId,
              score: cluster.score,
            },
          } as Prisma.InputJsonValue,
        },
      });

      if (teamIds.length > 0) {
        await tx.systemTeamLink.createMany({
          data: teamIds.map((teamId) => ({
            systemId: created.id,
            teamId,
          })),
        });
      }

      if (privateCloudProductIds.length > 0) {
        await tx.systemPrivateCloudProductLink.createMany({
          data: privateCloudProductIds.map((privateCloudProductId) => ({
            systemId: created.id,
            privateCloudProductId,
          })),
        });
      }

      if (publicCloudProductIds.length > 0) {
        await tx.systemPublicCloudProductLink.createMany({
          data: publicCloudProductIds.map((publicCloudProductId) => ({
            systemId: created.id,
            publicCloudProductId,
          })),
        });
      }

      const sourceSystemIds = sourceSystems.map((system) => system.id);

      await tx.systemTeamLink.deleteMany({
        where: {
          systemId: {
            in: sourceSystemIds,
          },
        },
      });

      await tx.systemPrivateCloudProductLink.deleteMany({
        where: {
          systemId: {
            in: sourceSystemIds,
          },
        },
      });

      await tx.systemPublicCloudProductLink.deleteMany({
        where: {
          systemId: {
            in: sourceSystemIds,
          },
        },
      });

      for (const sourceSystem of sourceSystems) {
        await tx.system.update({
          where: { id: sourceSystem.id },
          data: {
            status: SystemStatus.ARCHIVED,
            archivedAt: new Date(generatedAt),
            metadata: mergeJsonObject(sourceSystem.metadata, {
              consolidatedInto: {
                systemId: created.id,
                systemName: created.name,
                systemCode: created.code,
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

    await createAdminToolEvent(EventType.CREATE_SYSTEM, {
      id: createdSystem.id,
      data: {
        action: 'consolidate-system-cluster',
        clusterId: cluster.clusterId,
        clusterScore: cluster.score,
        inputFile: inputPath,
        consolidatedSystem: {
          id: createdSystem.id,
          name: createdSystem.name,
          code: createdSystem.code,
        },
        sourceSystems: sourceSystems.map((system) => ({
          id: system.id,
          name: system.name,
          code: system.code,
        })),
      },
    } as Prisma.InputJsonValue);

    return {
      ok: true,
      dryRun: false,
      clusterId: cluster.clusterId,
      score: cluster.score,
      consolidatedSystem: {
        id: createdSystem.id,
        name: createdSystem.name,
        code: createdSystem.code,
      },
      sourceSystemIds: sourceSystems.map((system) => system.id),
      movedTeamCount: teamIds.length,
      movedPrivateCloudProductCount: privateCloudProductIds.length,
      movedPublicCloudProductCount: publicCloudProductIds.length,
    };
  } catch (error) {
    return {
      ok: false,
      dryRun,
      clusterId: cluster.clusterId,
      score: cluster.score,
      error: error instanceof Error ? error.message : String(error),
      sourceSystemIds: cluster.systems.map((system) => system.id),
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

  logger.info('merge-systems-from-candidates completed', summary);
  console.log(
    `${summary.merged} cluster consolidations processed successfully from ${summary.processed} selected clusters. ${summary.failed} clusters failed.`,
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  logger.error('merge-systems-from-candidates failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
