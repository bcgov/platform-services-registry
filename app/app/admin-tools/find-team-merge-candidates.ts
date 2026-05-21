import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '@/core/logging';
import prisma from './prisma';

const cliArgsSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  jsonOut: z.string().min(1).optional(),
  mdOut: z.string().min(1).optional(),
  csvOut: z.string().min(1).optional(),
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
  'preview',
  'training',
  'perf',
  'performance',
]);

const genericTokens = new Set([
  'team',
  'teams',
  'system',
  'systems',
  'service',
  'services',
  'app',
  'application',
  'platform',
  'project',
]);

type LoadedTeam = Awaited<ReturnType<typeof loadTeams>>[number];
type ClusterReviewStatus = 'unreviewed' | 'approved' | 'rejected' | 'needs-manual-work';

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

function titleCaseToken(token: string) {
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function chooseDisplayToken(normalizedToken: string, memberTeams: LoadedTeam[]) {
  const observedForms = new Set<string>();

  for (const team of memberTeams) {
    for (const token of team.originalRootTokens) {
      if (token.toLowerCase() === normalizedToken) observedForms.add(token);
    }
  }

  if (observedForms.size === 0) return titleCaseToken(normalizedToken);

  const forms = Array.from(observedForms);
  if (forms.length > 1) return normalizedToken.toUpperCase();

  const [onlyForm] = forms;
  if (onlyForm.toUpperCase() === onlyForm && /[A-Z]/.test(onlyForm)) return onlyForm;
  if (onlyForm.length <= 4 && /^[A-Za-z]+$/.test(onlyForm) && onlyForm !== titleCaseToken(onlyForm)) {
    return onlyForm.toUpperCase();
  }
  return titleCaseToken(onlyForm);
}

function buildSuggestedCanonicalName(memberTeams: LoadedTeam[]) {
  const rootTokenLists = memberTeams.map((team) => team.rootTokens);
  const baseTokens = rootTokenLists
    .slice()
    .sort((left, right) => left.length - right.length)[0]
    ?.filter(Boolean);

  if (!baseTokens || baseTokens.length === 0) {
    return memberTeams
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

  if (commonOrderedTokens.length > 0) {
    return commonOrderedTokens.map((token) => chooseDisplayToken(token, memberTeams)).join(' ');
  }

  const shortestNames = memberTeams
    .slice()
    .sort((left, right) => left.name.length - right.name.length || left.name.localeCompare(right.name))
    .slice(0, 2)
    .map((team) => team.name);

  return Array.from(new Set(shortestNames)).join(' / ');
}

function sharedValues(left: Set<string>, right: Set<string>) {
  return Array.from(left)
    .filter((value) => right.has(value))
    .sort();
}

function overlapCoefficient(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const item of left) {
    if (right.has(item)) intersection += 1;
  }
  return intersection / Math.min(left.size, right.size);
}

function escapeCsv(value: string | number | boolean | null | undefined) {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

async function loadTeams() {
  const teams = await prisma.team.findMany({
    where: {
      OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
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
    orderBy: { name: 'asc' },
  });

  return teams.map((team) => {
    const rawTokens = tokenizeName(team.name);
    const originalTokens = tokenizeNamePreservingCase(team.name);
    const rootTokens = getRootTokens(rawTokens);
    const originalRootTokens = originalTokens.filter((token) => {
      const normalizedToken = token.toLowerCase();
      return !envTokens.has(normalizedToken) && !genericTokens.has(normalizedToken);
    });

    const memberRoleMap = new Map<string, Set<string>>();
    for (const member of team.members) {
      memberRoleMap.set(member.userId, new Set(member.roles));
    }

    const projectOwnerIds = new Set(
      team.members.filter((member) => member.roles.includes('PROJECT_OWNER')).map((member) => member.userId),
    );
    const primaryTechnicalLeadIds = new Set(
      team.members.filter((member) => member.roles.includes('PRIMARY_TECHNICAL_LEAD')).map((member) => member.userId),
    );
    const nonCoreMembers = team.members.filter(
      (member) => !member.roles.includes('PROJECT_OWNER') && !member.roles.includes('PRIMARY_TECHNICAL_LEAD'),
    );
    const nonCoreMemberIds = new Set(nonCoreMembers.map((member) => member.userId));

    return {
      ...team,
      rootTokens,
      originalRootTokens,
      projectOwnerIds,
      primaryTechnicalLeadIds,
      nonCoreMembers,
      nonCoreMemberIds,
      memberRoleMap,
      systemRecords: team.systemLinks.map((link) => ({
        id: link.system.id,
        name: link.system.name,
        code: link.system.code,
      })),
      privateCloudResourceRecords: team.privateCloudProductLinks.map((link) => ({
        id: link.privateCloudProduct.id,
        licencePlate: link.privateCloudProduct.licencePlate,
        name: link.privateCloudProduct.name,
      })),
      publicCloudResourceRecords: team.publicCloudProductLinks.map((link) => ({
        id: link.publicCloudProduct.id,
        licencePlate: link.publicCloudProduct.licencePlate,
        name: link.publicCloudProduct.name,
      })),
    };
  });
}

function buildCoreSignature(team: LoadedTeam) {
  const projectOwners = Array.from(team.projectOwnerIds).sort();
  const primaryTechnicalLeads = Array.from(team.primaryTechnicalLeadIds).sort();
  return {
    key: `po:${projectOwners.join(',')}|ptl:${primaryTechnicalLeads.join(',')}`,
    projectOwners,
    primaryTechnicalLeads,
  };
}

function buildSuggestedMembers(memberTeams: LoadedTeam[]) {
  const roleMap = new Map<string, Set<string>>();

  for (const team of memberTeams) {
    for (const member of team.members) {
      const existing = roleMap.get(member.userId) ?? new Set<string>();
      for (const role of member.roles) {
        existing.add(role);
      }
      roleMap.set(member.userId, existing);
    }
  }

  return Array.from(roleMap.entries())
    .map(([userId, roles]) => ({
      userId,
      roles: Array.from(roles).sort(),
    }))
    .sort((left, right) => left.userId.localeCompare(right.userId));
}

function buildClusterWarnings(memberTeams: LoadedTeam[]) {
  const warnings: string[] = [];
  const systemIds = new Set(memberTeams.flatMap((team) => team.systemRecords.map((system) => system.id)));
  const teamSystemSets = memberTeams.map((team) => new Set(team.systemRecords.map((system) => system.id)));

  let maxNonCoreOverlap = 0;
  for (let i = 0; i < memberTeams.length; i += 1) {
    for (let j = i + 1; j < memberTeams.length; j += 1) {
      maxNonCoreOverlap = Math.max(
        maxNonCoreOverlap,
        overlapCoefficient(memberTeams[i].nonCoreMemberIds, memberTeams[j].nonCoreMemberIds),
      );
    }
  }

  if (systemIds.size > 0 && teamSystemSets.some((set) => set.size === 0)) {
    warnings.push('Some teams in the cluster are not linked to any systems');
  }
  if (maxNonCoreOverlap === 0) {
    warnings.push('Teams share no non-core members beyond PROJECT_OWNER and PRIMARY_TECHNICAL_LEAD');
  }

  return warnings;
}

function calculateNonCoreMemberScore(memberTeams: LoadedTeam[]) {
  if (memberTeams.length < 2) return 1;

  const pairScores: number[] = [];
  for (let i = 0; i < memberTeams.length; i += 1) {
    for (let j = i + 1; j < memberTeams.length; j += 1) {
      pairScores.push(overlapCoefficient(memberTeams[i].nonCoreMemberIds, memberTeams[j].nonCoreMemberIds));
    }
  }

  if (pairScores.length === 0) return 1;
  return Number((pairScores.reduce((sum, score) => sum + score, 0) / pairScores.length).toFixed(4));
}

function buildClusters(teams: LoadedTeam[]) {
  const eligibleTeams: LoadedTeam[] = [];
  const excludedTeams: Array<{ id: string; name: string; reason: string }> = [];

  for (const team of teams) {
    if (team.projectOwnerIds.size === 0 || team.primaryTechnicalLeadIds.size === 0) {
      excludedTeams.push({
        id: team.id,
        name: team.name,
        reason: 'Missing PROJECT_OWNER or PRIMARY_TECHNICAL_LEAD',
      });
      continue;
    }
    eligibleTeams.push(team);
  }

  const grouped = new Map<string, LoadedTeam[]>();
  const signatureMap = new Map<
    string,
    {
      projectOwners: string[];
      primaryTechnicalLeads: string[];
    }
  >();

  for (const team of eligibleTeams) {
    const signature = buildCoreSignature(team);
    const bucket = grouped.get(signature.key) ?? [];
    bucket.push(team);
    grouped.set(signature.key, bucket);
    signatureMap.set(signature.key, {
      projectOwners: signature.projectOwners,
      primaryTechnicalLeads: signature.primaryTechnicalLeads,
    });
  }

  const candidateGroups = Array.from(grouped.entries())
    .filter(([, memberTeams]) => memberTeams.length >= 2)
    .sort((left, right) => right[1].length - left[1].length || left[1][0].name.localeCompare(right[1][0].name));

  const clusters = candidateGroups.map(([signatureKey, memberTeams], index) => {
    const signature = signatureMap.get(signatureKey)!;
    const suggestedCanonicalName = buildSuggestedCanonicalName(memberTeams);
    const suggestedMembers = buildSuggestedMembers(memberTeams);
    const nonCoreMemberScore = calculateNonCoreMemberScore(memberTeams);
    const linkedSystems = Array.from(
      new Map(memberTeams.flatMap((team) => team.systemRecords.map((system) => [system.id, system] as const))).values(),
    ).sort((left, right) => left.name.localeCompare(right.name));
    const linkedResources = Array.from(
      new Map(
        memberTeams.flatMap((team) =>
          [...team.privateCloudResourceRecords, ...team.publicCloudResourceRecords].map(
            (resource) => [resource.id, resource] as const,
          ),
        ),
      ).values(),
    ).sort((left, right) => left.name.localeCompare(right.name));
    const warnings = buildClusterWarnings(memberTeams);

    const overlapPairs: Array<{
      leftTeamId: string;
      leftTeamName: string;
      rightTeamId: string;
      rightTeamName: string;
      sharedNonCoreMembers: number;
      nonCoreMemberOverlap: number;
      sharedSystems: number;
    }> = [];

    for (let i = 0; i < memberTeams.length; i += 1) {
      for (let j = i + 1; j < memberTeams.length; j += 1) {
        const left = memberTeams[i];
        const right = memberTeams[j];
        const leftSystemIds = new Set(left.systemRecords.map((system) => system.id));
        const rightSystemIds = new Set(right.systemRecords.map((system) => system.id));
        overlapPairs.push({
          leftTeamId: left.id,
          leftTeamName: left.name,
          rightTeamId: right.id,
          rightTeamName: right.name,
          sharedNonCoreMembers: sharedValues(left.nonCoreMemberIds, right.nonCoreMemberIds).length,
          nonCoreMemberOverlap: Number(overlapCoefficient(left.nonCoreMemberIds, right.nonCoreMemberIds).toFixed(4)),
          sharedSystems: sharedValues(leftSystemIds, rightSystemIds).length,
        });
      }
    }

    return {
      clusterId: `cluster-${String(index + 1).padStart(3, '0')}`,
      reviewStatus: 'unreviewed' as ClusterReviewStatus,
      reviewNotes: '',
      signature: {
        projectOwnerIds: signature.projectOwners,
        primaryTechnicalLeadIds: signature.primaryTechnicalLeads,
      },
      nonCoreMemberScore,
      suggestedCanonicalName,
      suggestedMembers,
      warnings,
      teams: memberTeams.map((team) => ({
        id: team.id,
        name: team.name,
        code: team.code,
        members: team.members,
        linkedSystems: team.systemRecords,
        linkedPrivateCloudProducts: team.privateCloudResourceRecords,
        linkedPublicCloudProducts: team.publicCloudResourceRecords,
      })),
      linkedSystems,
      linkedResources,
      overlapPairs,
    };
  });

  return {
    clusters,
    excludedTeams,
    totalEligibleTeams: eligibleTeams.length,
  };
}

function renderMarkdownReport(report: {
  generatedAt: string;
  totalTeams: number;
  totalEligibleTeams: number;
  totalExcludedTeams: number;
  totalClusters: number;
  clusters: ReturnType<typeof buildClusters>['clusters'];
}) {
  const lines: string[] = [];

  lines.push('# Team Merge Candidates');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Teams scanned: ${report.totalTeams}`);
  lines.push(`Eligible teams: ${report.totalEligibleTeams}`);
  lines.push(`Excluded teams: ${report.totalExcludedTeams}`);
  lines.push(`Clusters found: ${report.totalClusters}`);
  lines.push('');

  if (report.clusters.length === 0) {
    lines.push('No merge candidate clusters found.');
    lines.push('');
    return `${lines.join('\n')}\n`;
  }

  for (const cluster of report.clusters) {
    lines.push(`## ${cluster.clusterId}`);
    lines.push('');
    lines.push(`- Review status: ${cluster.reviewStatus}`);
    lines.push(`- Suggested canonical name: ${cluster.suggestedCanonicalName}`);
    lines.push(`- Non-core member score: ${cluster.nonCoreMemberScore}`);
    lines.push(`- PROJECT_OWNER ids: ${cluster.signature.projectOwnerIds.join(', ')}`);
    lines.push(`- PRIMARY_TECHNICAL_LEAD ids: ${cluster.signature.primaryTechnicalLeadIds.join(', ')}`);
    if (cluster.warnings.length > 0) lines.push(`- Warnings: ${cluster.warnings.join('; ')}`);
    lines.push('');
    lines.push('Teams:');
    for (const team of cluster.teams) {
      const systems = team.linkedSystems.map((system) => system.code).join(', ') || 'None';
      lines.push(`- ${team.name} (${team.code}) | systems: ${systems} | members: ${team.members.length}`);
    }
    lines.push('');
    lines.push('Suggested Members:');
    for (const member of cluster.suggestedMembers) {
      lines.push(`- ${member.userId}: ${member.roles.join(', ')}`);
    }
    lines.push('');
    lines.push('Union Systems:');
    for (const system of cluster.linkedSystems) {
      lines.push(`- ${system.name} (${system.code})`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function renderCsvReport(report: { clusters: ReturnType<typeof buildClusters>['clusters'] }) {
  const header = [
    'clusterId',
    'reviewStatus',
    'suggestedCanonicalName',
    'nonCoreMemberScore',
    'projectOwnerIds',
    'primaryTechnicalLeadIds',
    'teamCount',
    'teamNames',
    'linkedSystemCount',
    'linkedSystemNames',
    'linkedResourceCount',
    'linkedResourceNames',
    'suggestedMemberCount',
    'warnings',
    'reviewNotes',
  ];

  const rows = report.clusters.map((cluster) => [
    cluster.clusterId,
    cluster.reviewStatus,
    cluster.suggestedCanonicalName,
    cluster.nonCoreMemberScore,
    cluster.signature.projectOwnerIds.join(' | '),
    cluster.signature.primaryTechnicalLeadIds.join(' | '),
    cluster.teams.length,
    cluster.teams.map((team) => team.name).join(' | '),
    cluster.linkedSystems.length,
    cluster.linkedSystems.map((system) => system.name).join(' | '),
    cluster.linkedResources.length,
    cluster.linkedResources.map((resource) => resource.name).join(' | '),
    cluster.suggestedMembers.length,
    cluster.warnings.join(' | '),
    cluster.reviewNotes,
  ]);

  return `${[header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')}\n`;
}

async function ensureParentDir(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
  const { limit, jsonOut, mdOut, csvOut } = parseArgs(process.argv);
  const teams = await loadTeams();
  const clusterResult = buildClusters(teams);
  const clusters = typeof limit === 'number' ? clusterResult.clusters.slice(0, limit) : clusterResult.clusters;
  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  const defaultBasePath = path.resolve(
    process.cwd(),
    'app',
    'admin-tools',
    'output',
    `team-merge-candidates-${timestamp}`,
  );
  const jsonPath = path.resolve(process.cwd(), jsonOut ?? `${defaultBasePath}.json`);
  const mdPath = path.resolve(process.cwd(), mdOut ?? `${defaultBasePath}.md`);
  const csvPath = path.resolve(process.cwd(), csvOut ?? `${defaultBasePath}.csv`);

  const report = {
    generatedAt: new Date().toISOString(),
    totalTeams: teams.length,
    totalEligibleTeams: clusterResult.totalEligibleTeams,
    totalExcludedTeams: clusterResult.excludedTeams.length,
    totalClusters: clusters.length,
    excludedTeams: clusterResult.excludedTeams,
    clusters,
  };

  await ensureParentDir(jsonPath);
  await ensureParentDir(mdPath);
  await ensureParentDir(csvPath);
  await writeFile(jsonPath, JSON.stringify(report, null, 2));
  await writeFile(mdPath, renderMarkdownReport(report));
  await writeFile(csvPath, renderCsvReport(report));

  logger.info('find-team-merge-candidates completed', {
    totalTeams: report.totalTeams,
    totalEligibleTeams: report.totalEligibleTeams,
    totalExcludedTeams: report.totalExcludedTeams,
    totalClusters: report.totalClusters,
    jsonPath,
    mdPath,
    csvPath,
  });

  console.log(
    `Identified ${report.totalClusters} candidate Team merge clusters from ${report.totalTeams} Teams. ${report.totalExcludedTeams} teams were excluded for missing core roles.`,
  );
  console.log(`JSON: ${jsonPath}`);
  console.log(`Markdown: ${mdPath}`);
  console.log(`CSV: ${csvPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  logger.error('find-team-merge-candidates failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
