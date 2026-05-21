import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '@/core/logging';
import { EntityOriginKind } from '@/prisma/client';
import prisma from './prisma';

const cliArgsSchema = z.object({
  minScore: z.coerce.number().min(0).max(1).optional(),
  limit: z.coerce.number().int().positive().optional(),
  jsonOut: z.string().min(1).optional(),
  mdOut: z.string().min(1).optional(),
  mode: z.enum(['generic', 'division-import']).default('generic'),
});

const envTokens = new Set([
  'dev',
  'development',
  'test',
  'testing',
  'prod',
  'production',
  'tool',
  'tools',
  'lab',
  'sandbox',
  'poc',
  'live',
  'staging',
  'stage',
  'qa',
  'uat',
  'demo',
  'nonprod',
  'non-production',
  'preview',
  'training',
  'perf',
  'performance',
]);

const genericTokens = new Set([
  'system',
  'systems',
  'app',
  'application',
  'platform',
  'service',
  'services',
  'team',
  'portal',
  'project',
  'products',
  'product',
  'registry',
]);

type LoadedSystem = Awaited<ReturnType<typeof loadSystems>>[number];

type ScoredPair = {
  leftId: string;
  rightId: string;
  score: number;
  reasons: string[];
  supportingSignals: {
    nameDice: number;
    tokenJaccard: number;
    sharedOrganization: boolean;
    sharedTeams: number;
    sharedMembers: number;
    resourceNameSimilarity: number;
    rootNameExactMatch: boolean;
    environmentVariantMatch: boolean;
  };
};

type ClusterReviewStatus = 'unreviewed' | 'approved' | 'rejected' | 'needs-manual-work';
type MatchingMode = 'generic' | 'division-import';

const focusedOriginKinds = new Set<EntityOriginKind>([EntityOriginKind.IMPORTED_OTHER]);

function parseArgs(argv: string[]) {
  const rawArgs = argv.slice(2);
  const args: Record<string, string> = {};

  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];
    const value = rawArgs[i + 1];

    if (!value) continue;

    if (token === '--min-score') {
      args.minScore = value;
      i += 1;
      continue;
    }

    if (token === '--limit') {
      args.limit = value;
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

    if (token === '--mode') {
      args.mode = value;
      i += 1;
    }
  }

  return cliArgsSchema.parse(args);
}

function getEffectiveMinScore(mode: MatchingMode, minScore?: number) {
  if (typeof minScore === 'number') return minScore;
  return mode === 'division-import' ? 0.52 : 0.62;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function tokenizeName(value: string) {
  return normalizeWhitespace(
    value
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[(){}[\],.:/\\+_-]+/g, ' ')
      .replace(/[^a-z0-9 ]+/g, ' '),
  )
    .split(' ')
    .filter(Boolean);
}

function normalizeName(value: string) {
  return normalizeWhitespace(tokenizeName(value).join(' '));
}

function tokenizeNamePreservingCase(value: string) {
  return normalizeWhitespace(
    value
      .replace(/&/g, ' and ')
      .replace(/[(){}[\],.:/\\+_-]+/g, ' ')
      .replace(/[^A-Za-z0-9 ]+/g, ' '),
  )
    .split(' ')
    .filter(Boolean);
}

function getRootTokens(tokens: string[]) {
  return tokens.filter((token) => !envTokens.has(token) && !genericTokens.has(token));
}

function getEnvironmentTokens(tokens: string[]) {
  return tokens.filter((token) => envTokens.has(token));
}

function titleCaseToken(token: string) {
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function chooseDisplayToken(normalizedToken: string, memberSystems: LoadedSystem[]) {
  const observedForms = new Set<string>();

  for (const system of memberSystems) {
    for (const token of system.originalRootTokens) {
      if (token.toLowerCase() === normalizedToken) {
        observedForms.add(token);
      }
    }
  }

  if (observedForms.size === 0) {
    return titleCaseToken(normalizedToken);
  }

  const forms = Array.from(observedForms);
  const hasMixedCasing = forms.length > 1;
  if (hasMixedCasing) {
    return normalizedToken.toUpperCase();
  }

  const [onlyForm] = forms;
  if (onlyForm.toUpperCase() === onlyForm && /[A-Z]/.test(onlyForm)) {
    return onlyForm;
  }

  if (onlyForm.length <= 4 && /^[A-Za-z]+$/.test(onlyForm) && onlyForm !== titleCaseToken(onlyForm)) {
    return onlyForm.toUpperCase();
  }

  return titleCaseToken(onlyForm);
}

function buildSuggestedCanonicalName(memberSystems: LoadedSystem[]) {
  const rootTokenLists = memberSystems.map((system) => system.rootTokens);
  const baseTokens = rootTokenLists
    .slice()
    .sort((left, right) => left.length - right.length)[0]
    ?.filter(Boolean);

  if (!baseTokens || baseTokens.length === 0) {
    return memberSystems
      .slice()
      .sort((left, right) => left.name.length - right.name.length || left.name.localeCompare(right.name))[0]?.name;
  }

  const commonOrderedTokens: string[] = [];
  const seen = new Set<string>();
  for (const token of baseTokens) {
    if (seen.has(token)) continue;
    const presentInAll = rootTokenLists.every((tokens) => tokens.includes(token));
    if (presentInAll) {
      commonOrderedTokens.push(token);
      seen.add(token);
    }
  }

  if (commonOrderedTokens.length === 0) {
    return memberSystems
      .slice()
      .sort((left, right) => left.name.length - right.name.length || left.name.localeCompare(right.name))[0]?.name;
  }

  const suggested = commonOrderedTokens.map((token) => chooseDisplayToken(token, memberSystems)).join(' ');
  return suggested || memberSystems[0]?.name;
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

function overlapCoefficient(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const item of left) {
    if (right.has(item)) intersection += 1;
  }
  return intersection / Math.min(left.size, right.size);
}

function sharedValues(left: Set<string>, right: Set<string>) {
  return Array.from(left)
    .filter((value) => right.has(value))
    .sort();
}

function getSourceProvenance(system: { metadata?: unknown }) {
  if (!isObjectRecord(system.metadata)) return null;
  const provenance = system.metadata.provenance;
  if (!isObjectRecord(provenance)) return null;
  const source = provenance.source;
  if (!isObjectRecord(source)) return null;

  return {
    model: typeof source.model === 'string' ? source.model : null,
    id: typeof source.id === 'string' ? source.id : null,
    licencePlate: typeof source.licencePlate === 'string' ? source.licencePlate : null,
  };
}

async function loadSystems() {
  const systems = await prisma.system.findMany({
    where: {
      OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
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
              members: true,
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
    orderBy: { name: 'asc' },
  });

  return systems.map((system) => {
    const rawTokens = tokenizeName(system.name);
    const originalTokens = tokenizeNamePreservingCase(system.name);
    const originalRootTokens = originalTokens.filter((token) => {
      const normalizedToken = token.toLowerCase();
      return !envTokens.has(normalizedToken) && !genericTokens.has(normalizedToken);
    });
    const rootTokens = getRootTokens(rawTokens);
    const envOnlyTokens = getEnvironmentTokens(rawTokens);
    const normalizedName = normalizeWhitespace(rawTokens.join(' '));
    const normalizedRootName = normalizeWhitespace(rootTokens.join(' '));
    const teamIds = new Set(system.teamLinks.map((link) => link.team.id));
    const teamNames = system.teamLinks.map((link) => link.team.name).sort();
    const memberIds = new Set(system.teamLinks.flatMap((link) => link.team.members.map((member) => member.userId)));
    const resourceRecords = [
      ...system.privateCloudProductLinks.map((link) => ({
        type: 'private-cloud-product' as const,
        id: link.privateCloudProduct.id,
        licencePlate: link.privateCloudProduct.licencePlate,
        name: link.privateCloudProduct.name,
      })),
      ...system.publicCloudProductLinks.map((link) => ({
        type: 'public-cloud-product' as const,
        id: link.publicCloudProduct.id,
        licencePlate: link.publicCloudProduct.licencePlate,
        name: link.publicCloudProduct.name,
      })),
    ];
    const resourceNames = resourceRecords.map((resource) => resource.name);
    const normalizedResourceNames = resourceNames.map((name) => normalizeName(name)).filter(Boolean);
    const provenance = getSourceProvenance(system);

    return {
      ...system,
      normalizedName,
      normalizedRootName,
      originalRootTokens,
      rootTokens,
      rootTokenSet: new Set(rootTokens),
      envTokenSet: new Set(envOnlyTokens),
      teamIds,
      teamNames,
      memberIds,
      resourceRecords,
      resourceNames,
      normalizedResourceNames,
      provenance,
      teamCount: system.teamLinks.length,
      memberCount: memberIds.size,
      resourceCount: resourceRecords.length,
      isFocusedOrigin: focusedOriginKinds.has(system.originKind),
    };
  });
}

function getBestResourceNameSimilarity(left: LoadedSystem, right: LoadedSystem) {
  let best = 0;
  for (const leftName of left.normalizedResourceNames) {
    for (const rightName of right.normalizedResourceNames) {
      best = Math.max(best, diceCoefficient(leftName, rightName));
    }
  }
  return best;
}

function scorePair(left: LoadedSystem, right: LoadedSystem, mode: MatchingMode): ScoredPair | null {
  const rootNameExactMatch =
    !!left.normalizedRootName && !!right.normalizedRootName && left.normalizedRootName === right.normalizedRootName;
  const nameDice = diceCoefficient(
    left.normalizedRootName || left.normalizedName,
    right.normalizedRootName || right.normalizedName,
  );
  const tokenJaccard = jaccardSimilarity(left.rootTokenSet, right.rootTokenSet);
  const sharedOrganization = !!left.organizationId && left.organizationId === right.organizationId;
  const organizationMismatch = left.organizationId !== right.organizationId;
  const sharedTeams = sharedValues(left.teamIds, right.teamIds);
  const sharedMembers = sharedValues(left.memberIds, right.memberIds);
  const resourceNameSimilarity = getBestResourceNameSimilarity(left, right);
  const environmentVariantMatch =
    rootNameExactMatch &&
    (left.envTokenSet.size > 0 || right.envTokenSet.size > 0) &&
    diceCoefficient(left.normalizedName, right.normalizedName) < 1;

  let score = 0;
  const reasons: string[] = [];
  const focusPair = left.isFocusedOrigin || right.isFocusedOrigin;
  const suppressOperationalSignals = mode === 'division-import' && focusPair;
  const allowOrganizationGap = mode === 'division-import' && focusPair;

  if (organizationMismatch && !allowOrganizationGap) {
    return null;
  }

  if (rootNameExactMatch) {
    score += 0.44;
    reasons.push(`Exact root-name match on "${left.normalizedRootName}"`);
  } else {
    score += nameDice * 0.34;
    score += tokenJaccard * 0.18;

    if (nameDice >= 0.82) reasons.push(`High name similarity (${nameDice.toFixed(2)})`);
    if (tokenJaccard >= 0.75) reasons.push(`Strong token overlap (${tokenJaccard.toFixed(2)})`);
  }

  const leftNameContainsRight =
    !!left.normalizedRootName &&
    !!right.normalizedRootName &&
    (left.normalizedRootName.includes(right.normalizedRootName) ||
      right.normalizedRootName.includes(left.normalizedRootName));

  if (leftNameContainsRight && left.normalizedRootName !== right.normalizedRootName) {
    score += 0.07;
    reasons.push('One normalized name contains the other');
  }

  if (environmentVariantMatch) {
    score += 0.12;
    reasons.push('Names differ mainly by environment qualifiers');
  }

  if (sharedOrganization) {
    score += 0.08;
    reasons.push('Same organization');
  } else if (organizationMismatch && allowOrganizationGap) {
    reasons.push('Organization mismatch ignored in division-import mode');
  }

  if (!suppressOperationalSignals && sharedTeams.length > 0) {
    const teamOverlap = overlapCoefficient(left.teamIds, right.teamIds);
    score += teamOverlap * 0.16;
    reasons.push(`Shared linked teams (${sharedTeams.length})`);
  }

  if (!suppressOperationalSignals && sharedMembers.length > 0) {
    const memberOverlap = overlapCoefficient(left.memberIds, right.memberIds);
    score += memberOverlap * 0.18;
    reasons.push(`Shared team members (${sharedMembers.length})`);
  }

  if (!suppressOperationalSignals && resourceNameSimilarity >= 0.8) {
    score += 0.08;
    reasons.push(`Linked resource names are very similar (${resourceNameSimilarity.toFixed(2)})`);
  } else if (!suppressOperationalSignals && resourceNameSimilarity >= 0.65) {
    score += 0.04;
    reasons.push(`Linked resource names are similar (${resourceNameSimilarity.toFixed(2)})`);
  }

  if (mode === 'division-import' && focusPair) {
    if (rootNameExactMatch) {
      score += 0.08;
      reasons.push('Division-import mode boosts exact root-name match');
    } else if (nameDice >= 0.72) {
      score += 0.06;
      reasons.push(`Division-import mode boosts name similarity (${nameDice.toFixed(2)})`);
    }
  }

  if (
    left.rootTokens.length < 2 &&
    right.rootTokens.length < 2 &&
    (suppressOperationalSignals || (sharedMembers.length === 0 && sharedTeams.length === 0))
  ) {
    score -= 0.08;
    reasons.push('Short/generic names reduce confidence');
  }

  if (score <= 0) return null;

  return {
    leftId: left.id,
    rightId: right.id,
    score: Math.max(0, Math.min(1, Number(score.toFixed(4)))),
    reasons: Array.from(new Set(reasons)),
    supportingSignals: {
      nameDice: Number(nameDice.toFixed(4)),
      tokenJaccard: Number(tokenJaccard.toFixed(4)),
      sharedOrganization,
      sharedTeams: sharedTeams.length,
      sharedMembers: sharedMembers.length,
      resourceNameSimilarity: Number(resourceNameSimilarity.toFixed(4)),
      rootNameExactMatch,
      environmentVariantMatch,
    },
  };
}

function buildClusters(systems: LoadedSystem[], scoredPairs: ScoredPair[], minScore: number) {
  const strongPairs = scoredPairs.filter((pair) => pair.score >= minScore);
  const adjacency = new Map<string, Set<string>>();

  for (const pair of strongPairs) {
    const leftNeighbors = adjacency.get(pair.leftId) ?? new Set<string>();
    leftNeighbors.add(pair.rightId);
    adjacency.set(pair.leftId, leftNeighbors);

    const rightNeighbors = adjacency.get(pair.rightId) ?? new Set<string>();
    rightNeighbors.add(pair.leftId);
    adjacency.set(pair.rightId, rightNeighbors);
  }

  const systemMap = new Map(systems.map((system) => [system.id, system]));
  const pairMap = new Map(scoredPairs.map((pair) => [`${[pair.leftId, pair.rightId].sort().join(':')}`, pair]));
  const visited = new Set<string>();
  const clusters: Array<{
    memberIds: string[];
    edges: ScoredPair[];
    averageScore: number;
    density: number;
    confidence: 'high' | 'possible';
    warnings: string[];
  }> = [];

  for (const system of systems) {
    if (visited.has(system.id) || !adjacency.has(system.id)) continue;

    const stack = [system.id];
    const componentIds: string[] = [];
    visited.add(system.id);

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      componentIds.push(currentId);

      for (const neighbor of adjacency.get(currentId) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }

    if (componentIds.length < 2) continue;

    componentIds.sort((leftId, rightId) => {
      const left = systemMap.get(leftId)!;
      const right = systemMap.get(rightId)!;
      return left.name.localeCompare(right.name);
    });

    const componentEdges: ScoredPair[] = [];
    for (let i = 0; i < componentIds.length; i += 1) {
      for (let j = i + 1; j < componentIds.length; j += 1) {
        const key = [componentIds[i], componentIds[j]].sort().join(':');
        const pair = pairMap.get(key);
        if (pair && pair.score >= minScore) componentEdges.push(pair);
      }
    }

    const totalPossibleEdges = (componentIds.length * (componentIds.length - 1)) / 2;
    const averageScore =
      componentEdges.length > 0
        ? Number((componentEdges.reduce((sum, pair) => sum + pair.score, 0) / componentEdges.length).toFixed(4))
        : 0;
    const density = totalPossibleEdges > 0 ? Number((componentEdges.length / totalPossibleEdges).toFixed(4)) : 0;
    const confidence = averageScore >= 0.75 && density >= 0.5 ? 'high' : 'possible';
    const warnings: string[] = [];
    if (density < 0.5) warnings.push('Cluster is connected by sparse pairwise links');

    const memberSystems = componentIds.map((id) => systemMap.get(id)!);
    if (!memberSystems.some((system) => system.isFocusedOrigin)) continue;

    clusters.push({
      memberIds: componentIds,
      edges: componentEdges.sort((left, right) => right.score - left.score),
      averageScore,
      density,
      confidence,
      warnings,
    });
  }

  return clusters
    .sort((left, right) => right.averageScore - left.averageScore || right.memberIds.length - left.memberIds.length)
    .map((cluster, index) => {
      const memberSystems = cluster.memberIds.map((id) => systemMap.get(id)!);
      const suggestedCanonical = [...memberSystems].sort((left, right) => {
        return (
          right.resourceCount - left.resourceCount ||
          right.teamCount - left.teamCount ||
          right.memberCount - left.memberCount ||
          left.createdAt.getTime() - right.createdAt.getTime() ||
          left.name.localeCompare(right.name)
        );
      })[0];

      const allTeamNames = Array.from(new Set(memberSystems.flatMap((system) => system.teamNames))).sort();
      const allResourceNames = Array.from(
        new Set(memberSystems.flatMap((system) => system.resourceRecords.map((resource) => resource.name))),
      ).sort();
      const suggestedCanonicalName = buildSuggestedCanonicalName(memberSystems);

      return {
        clusterId: `cluster-${String(index + 1).padStart(3, '0')}`,
        confidence: cluster.confidence,
        reviewStatus: 'unreviewed' as ClusterReviewStatus,
        reviewNotes: '',
        suggestedCanonicalSystemId: suggestedCanonical.id,
        suggestedCanonicalName,
        score: cluster.averageScore,
        density: cluster.density,
        reasons: Array.from(new Set(cluster.edges.flatMap((edge) => edge.reasons))).slice(0, 8),
        warnings: cluster.warnings,
        systems: memberSystems.map((system) => ({
          id: system.id,
          name: system.name,
          code: system.code,
          originKind: system.originKind,
          organization: system.organization
            ? {
                id: system.organization.id,
                code: system.organization.code,
                name: system.organization.name,
              }
            : null,
          linkedTeams: system.teamLinks.map((link) => ({
            id: link.team.id,
            name: link.team.name,
            code: link.team.code,
          })),
          linkedResources: system.resourceRecords,
          memberCount: system.memberCount,
          resourceCount: system.resourceCount,
          provenance: system.provenance,
        })),
        sharedContext: {
          teamNames: allTeamNames,
          resourceNames: allResourceNames,
        },
        edges: cluster.edges.map((edge) => {
          const left = systemMap.get(edge.leftId)!;
          const right = systemMap.get(edge.rightId)!;
          return {
            fromSystemId: edge.leftId,
            fromSystemName: left.name,
            toSystemId: edge.rightId,
            toSystemName: right.name,
            score: edge.score,
            reasons: edge.reasons,
            supportingSignals: edge.supportingSignals,
          };
        }),
      };
    });
}

function renderMarkdownReport(report: {
  generatedAt: string;
  minScore: number;
  mode: MatchingMode;
  totalSystems: number;
  focusedSystems: number;
  totalClusters: number;
  totalSystemsIncludedInClusters: number;
  clusters: ReturnType<typeof buildClusters>;
}) {
  const lines: string[] = [];

  lines.push('# System Merge Candidates');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Mode: ${report.mode}`);
  lines.push(`Threshold: ${report.minScore}`);
  lines.push(`Systems scanned: ${report.totalSystems}`);
  lines.push(`Focused imported systems: ${report.focusedSystems}`);
  lines.push(`Clusters found: ${report.totalClusters}`);
  lines.push(`Systems included in clusters: ${report.totalSystemsIncludedInClusters}`);
  lines.push('');

  if (report.clusters.length === 0) {
    lines.push('No merge candidate clusters found.');
    lines.push('');
    return `${lines.join('\n')}\n`;
  }

  for (const cluster of report.clusters) {
    lines.push(`## ${cluster.clusterId}`);
    lines.push('');
    lines.push(`- Confidence: ${cluster.confidence}`);
    lines.push(`- Review status: ${cluster.reviewStatus}`);
    lines.push(`- Suggested canonical system id: ${cluster.suggestedCanonicalSystemId}`);
    lines.push(`- Suggested canonical name: ${cluster.suggestedCanonicalName}`);
    lines.push(`- Cluster score: ${cluster.score}`);
    lines.push(`- Density: ${cluster.density}`);
    if (cluster.reasons.length > 0) lines.push(`- Reasons: ${cluster.reasons.join('; ')}`);
    if (cluster.warnings.length > 0) lines.push(`- Warnings: ${cluster.warnings.join('; ')}`);
    lines.push('');
    lines.push('Systems:');
    for (const system of cluster.systems) {
      const organization = system.organization?.name ?? 'No organization';
      const resources = system.linkedResources.map((resource) => resource.licencePlate).join(', ') || 'None';
      lines.push(
        `- ${system.name} (${system.code}) | origin: ${system.originKind} | org: ${organization} | teams: ${system.linkedTeams.length} | members: ${system.memberCount} | resources: ${resources}`,
      );
    }
    lines.push('');
    lines.push('Edges:');
    for (const edge of cluster.edges) {
      lines.push(`- ${edge.fromSystemName} -> ${edge.toSystemName} | score ${edge.score} | ${edge.reasons.join('; ')}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function ensureParentDir(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
  const { minScore, limit, jsonOut, mdOut, mode } = parseArgs(process.argv);
  const effectiveMinScore = getEffectiveMinScore(mode, minScore);
  const systems = await loadSystems();
  const scoredPairs: ScoredPair[] = [];

  for (let i = 0; i < systems.length; i += 1) {
    for (let j = i + 1; j < systems.length; j += 1) {
      const pair = scorePair(systems[i], systems[j], mode);
      if (pair) scoredPairs.push(pair);
    }
  }

  const allClusters = buildClusters(systems, scoredPairs, effectiveMinScore);
  const clusters = typeof limit === 'number' ? allClusters.slice(0, limit) : allClusters;
  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  const defaultBasePath = path.resolve(
    process.cwd(),
    'app',
    'admin-tools',
    'output',
    `system-merge-candidates-${timestamp}`,
  );
  const jsonPath = path.resolve(process.cwd(), jsonOut ?? `${defaultBasePath}.json`);
  const mdPath = path.resolve(process.cwd(), mdOut ?? `${defaultBasePath}.md`);

  const report = {
    generatedAt: new Date().toISOString(),
    minScore: effectiveMinScore,
    mode,
    totalSystems: systems.length,
    focusedSystems: systems.filter((system) => system.isFocusedOrigin).length,
    totalPairsScored: scoredPairs.length,
    totalClusters: clusters.length,
    totalSystemsIncludedInClusters: new Set(clusters.flatMap((cluster) => cluster.systems.map((system) => system.id)))
      .size,
    totalHighConfidenceClusters: clusters.filter((cluster) => cluster.confidence === 'high').length,
    totalPossibleClusters: clusters.filter((cluster) => cluster.confidence === 'possible').length,
    clusters,
  };

  await ensureParentDir(jsonPath);
  await ensureParentDir(mdPath);
  await writeFile(jsonPath, JSON.stringify(report, null, 2));
  await writeFile(mdPath, renderMarkdownReport(report));

  logger.info('find-system-merge-candidates completed', {
    totalSystems: report.totalSystems,
    totalPairsScored: report.totalPairsScored,
    totalClusters: report.totalClusters,
    minScore,
    jsonPath,
    mdPath,
  });

  console.log(
    `Identified ${report.totalClusters} candidate System merge clusters from ${report.totalSystems} Systems. ${report.totalHighConfidenceClusters} high-confidence clusters and ${report.totalPossibleClusters} possible clusters were written to review artifacts.`,
  );
  console.log(`JSON: ${jsonPath}`);
  console.log(`Markdown: ${mdPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  logger.error('find-system-merge-candidates failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
