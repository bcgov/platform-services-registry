import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '@/core/logging';
import { ProjectContext } from '@/prisma/client';
import prisma from './prisma';

const cliArgsSchema = z.object({
  csvOut: z.string().min(1).optional(),
  jsonOut: z.string().min(1).optional(),
  mdOut: z.string().min(1).optional(),
});

const outputDirectory = 'app/admin-tools/output';

type ProductContext = 'PRIVATE' | 'PUBLIC';

type ProductRow = {
  context: ProductContext;
  id: string;
  licencePlate: string;
  name: string;
  providerOrCluster: string;
  status: string;
  archivedAt: Date | null;
  organization: { code: string; name: string } | null;
};

type SecurityFindingRow = {
  context: ProductContext;
  id: string;
  licencePlate: string;
  name: string;
  providerOrCluster: string;
  status: string;
  archived: boolean;
  organizationCode: string;
  organizationName: string;
  repositoryCount: number;
  repositories: string[];
  sonarScanCount: number;
  latestSonarScannedAt: string | null;
  acsPresent: boolean;
  acsAlertCount: number;
  acsImageCount: number;
  latestAcsScannedAt: string | null;
  zapSupported: boolean;
  zapScanCount: number;
  latestZapScannedAt: string | null;
  matchedSignals: string[];
  notes: string[];
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
    }
  }

  return cliArgsSchema.parse(args);
}

function escapeCsv(value: string | number | boolean | null | undefined) {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function normalizeRepositoryUrl(url: string) {
  return url.trim();
}

function isPopulatedRepositoryUrl(url: string) {
  const normalized = normalizeRepositoryUrl(url);
  return normalized.length > 0 && normalized !== 'https://';
}

async function main() {
  const { csvOut, jsonOut, mdOut } = parseArgs(process.argv);
  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  const csvPath = path.resolve(
    process.cwd(),
    csvOut ?? `${outputDirectory}/cloud-products-with-security-data-${timestamp}.csv`,
  );
  const jsonPath = path.resolve(
    process.cwd(),
    jsonOut ?? `${outputDirectory}/cloud-products-with-security-data-${timestamp}.json`,
  );
  const mdPath = path.resolve(
    process.cwd(),
    mdOut ?? `${outputDirectory}/cloud-products-with-security-data-${timestamp}.md`,
  );

  const [privateProducts, publicProducts, securityConfigs, sonarResults, acsResults, privateZapResults] =
    await Promise.all([
      prisma.privateCloudProduct.findMany({
        select: {
          id: true,
          licencePlate: true,
          name: true,
          cluster: true,
          status: true,
          archivedAt: true,
          organization: {
            select: {
              code: true,
              name: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.publicCloudProduct.findMany({
        select: {
          id: true,
          licencePlate: true,
          name: true,
          provider: true,
          status: true,
          archivedAt: true,
          organization: {
            select: {
              code: true,
              name: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.securityConfig.findMany({
        select: {
          context: true,
          licencePlate: true,
          repositories: true,
        },
      }),
      prisma.sonarScanResult.findMany({
        select: {
          context: true,
          licencePlate: true,
          scannedAt: true,
        },
        orderBy: { scannedAt: 'desc' },
      }),
      prisma.acsResult.findMany({
        select: {
          licencePlate: true,
          scannedAt: true,
          alerts: true,
          images: true,
        },
        orderBy: { scannedAt: 'desc' },
      }),
      prisma.privateCloudProductZapResult.findMany({
        select: {
          licencePlate: true,
          scannedAt: true,
          html: true,
          available: true,
        },
        orderBy: { scannedAt: 'desc' },
      }),
    ]);

  const products: ProductRow[] = [
    ...privateProducts.map((product) => ({
      context: 'PRIVATE' as const,
      id: product.id,
      licencePlate: product.licencePlate,
      name: product.name,
      providerOrCluster: String(product.cluster),
      status: String(product.status),
      archivedAt: product.archivedAt,
      organization: product.organization,
    })),
    ...publicProducts.map((product) => ({
      context: 'PUBLIC' as const,
      id: product.id,
      licencePlate: product.licencePlate,
      name: product.name,
      providerOrCluster: String(product.provider),
      status: String(product.status),
      archivedAt: product.archivedAt,
      organization: product.organization,
    })),
  ];

  const configByKey = new Map(securityConfigs.map((row) => [`${row.context}:${row.licencePlate}`, row] as const));
  const sonarByKey = new Map<string, Array<{ scannedAt: Date }>>();
  const acsByLicencePlate = new Map<string, Array<{ scannedAt: Date; alerts: unknown[]; images: unknown[] }>>();
  const privateZapByLicencePlate = new Map<
    string,
    Array<{ scannedAt: Date; html: string | null; available: boolean | null }>
  >();

  for (const row of sonarResults) {
    const key = `${row.context}:${row.licencePlate}`;
    const current = sonarByKey.get(key) ?? [];
    current.push({ scannedAt: row.scannedAt });
    sonarByKey.set(key, current);
  }

  for (const row of acsResults) {
    const current = acsByLicencePlate.get(row.licencePlate) ?? [];
    current.push({ scannedAt: row.scannedAt, alerts: row.alerts ?? [], images: row.images ?? [] });
    acsByLicencePlate.set(row.licencePlate, current);
  }

  for (const row of privateZapResults) {
    const current = privateZapByLicencePlate.get(row.licencePlate) ?? [];
    current.push({ scannedAt: row.scannedAt, html: row.html ?? null, available: row.available ?? null });
    privateZapByLicencePlate.set(row.licencePlate, current);
  }

  const findings: SecurityFindingRow[] = products
    .map((product) => {
      const securityContext = product.context === 'PRIVATE' ? ProjectContext.PRIVATE : ProjectContext.PUBLIC;
      const config = configByKey.get(`${securityContext}:${product.licencePlate}`);
      const repositories = (config?.repositories ?? [])
        .map((repository) => normalizeRepositoryUrl(repository.url))
        .filter(isPopulatedRepositoryUrl);

      const sonar = sonarByKey.get(`${securityContext}:${product.licencePlate}`) ?? [];
      const acs = acsByLicencePlate.get(product.licencePlate) ?? [];
      const privateZap = product.context === 'PRIVATE' ? privateZapByLicencePlate.get(product.licencePlate) ?? [] : [];
      const populatedPrivateZap = privateZap.filter((row) => row.html || row.available !== null);

      const latestSonarScannedAt = sonar[0]?.scannedAt?.toISOString() ?? null;
      const latestAcsScannedAt = acs[0]?.scannedAt?.toISOString() ?? null;
      const latestZapScannedAt = populatedPrivateZap[0]?.scannedAt?.toISOString() ?? null;
      const acsAlertCount = acs.reduce((sum, row) => sum + row.alerts.length, 0);
      const acsImageCount = acs.reduce((sum, row) => sum + row.images.length, 0);
      const acsPresent = acs.length > 0;
      const zapSupported = product.context === 'PRIVATE';
      const zapScanCount = populatedPrivateZap.length;

      const matchedSignals = [
        repositories.length > 0 ? 'repositories' : null,
        sonar.length > 0 ? 'sonar' : null,
        acsPresent ? 'acs' : null,
        zapScanCount > 0 ? 'zap' : null,
      ].filter(Boolean) as string[];

      const notes: string[] = [];
      if (repositories.length > 0) {
        notes.push(`${repositories.length} populated repositor${repositories.length === 1 ? 'y' : 'ies'}`); // codespell:ignore
      }
      if (sonar.length > 0) {
        notes.push(`${sonar.length} Sonar scan result${sonar.length === 1 ? '' : 's'}`);
      }
      if (acsPresent) {
        notes.push(
          `${acsAlertCount} ACS alert${acsAlertCount === 1 ? '' : 's'}, ${acsImageCount} image${
            acsImageCount === 1 ? '' : 's'
          }`,
        );
      }
      if (zapSupported) {
        if (zapScanCount > 0) {
          notes.push(`${zapScanCount} ZAP result${zapScanCount === 1 ? '' : 's'}`);
        }
      } else {
        notes.push('No dedicated public-cloud ZAP result model exists in the current schema');
      }

      return {
        context: product.context,
        id: product.id,
        licencePlate: product.licencePlate,
        name: product.name,
        providerOrCluster: product.providerOrCluster,
        status: product.status,
        archived: !!product.archivedAt,
        organizationCode: product.organization?.code ?? '',
        organizationName: product.organization?.name ?? '',
        repositoryCount: repositories.length,
        repositories,
        sonarScanCount: sonar.length,
        latestSonarScannedAt,
        acsPresent,
        acsAlertCount,
        acsImageCount,
        latestAcsScannedAt,
        zapSupported,
        zapScanCount,
        latestZapScannedAt,
        matchedSignals,
        notes,
      };
    })
    .filter((row) => row.repositoryCount > 0 || row.sonarScanCount > 0 || row.acsPresent || row.zapScanCount > 0);

  const summary = {
    ok: true,
    scannedProducts: products.length,
    scannedPrivateCloudProducts: privateProducts.length,
    scannedPublicCloudProducts: publicProducts.length,
    matchedProducts: findings.length,
    matchedPrivateCloudProducts: findings.filter((row) => row.context === 'PRIVATE').length,
    matchedPublicCloudProducts: findings.filter((row) => row.context === 'PUBLIC').length,
    repositoryMatches: findings.filter((row) => row.repositoryCount > 0).length,
    sonarMatches: findings.filter((row) => row.sonarScanCount > 0).length,
    acsMatches: findings.filter((row) => row.acsPresent).length,
    zapMatches: findings.filter((row) => row.zapScanCount > 0).length,
    outputs: {
      csv: csvPath,
      json: jsonPath,
      md: mdPath,
    },
    findings,
  };

  const csvLines = [
    [
      'context',
      'licencePlate',
      'name',
      'providerOrCluster',
      'status',
      'archived',
      'organizationCode',
      'organizationName',
      'repositoryCount',
      'repositories',
      'sonarScanCount',
      'latestSonarScannedAt',
      'acsPresent',
      'acsAlertCount',
      'acsImageCount',
      'latestAcsScannedAt',
      'zapSupported',
      'zapScanCount',
      'latestZapScannedAt',
      'matchedSignals',
      'notes',
    ]
      .map(escapeCsv)
      .join(','),
    ...findings.map((row) =>
      [
        row.context,
        row.licencePlate,
        row.name,
        row.providerOrCluster,
        row.status,
        row.archived,
        row.organizationCode,
        row.organizationName,
        row.repositoryCount,
        row.repositories.join(' | '),
        row.sonarScanCount,
        row.latestSonarScannedAt,
        row.acsPresent,
        row.acsAlertCount,
        row.acsImageCount,
        row.latestAcsScannedAt,
        row.zapSupported,
        row.zapScanCount,
        row.latestZapScannedAt,
        row.matchedSignals.join(', '),
        row.notes.join(' | '),
      ]
        .map(escapeCsv)
        .join(','),
    ),
  ].join('\n');

  const mdLines = [
    '# Cloud Products With Security Data',
    '',
    `Scanned products: ${products.length}`,
    `Scanned private cloud products: ${privateProducts.length}`,
    `Scanned public cloud products: ${publicProducts.length}`,
    `Matched products: ${findings.length}`,
    `Matched private cloud products: ${summary.matchedPrivateCloudProducts}`,
    `Matched public cloud products: ${summary.matchedPublicCloudProducts}`,
    `Repository matches: ${summary.repositoryMatches}`,
    `Sonar matches: ${summary.sonarMatches}`,
    `ACS matches: ${summary.acsMatches}`,
    `ZAP matches: ${summary.zapMatches}`,
    '',
    'Notes:',
    '- ACS results are keyed by licence plate only in the current schema, so this report matches them to both public/private products by licence plate.',
    '- ZAP results have a private-cloud-specific model today; public cloud products are reported as not having dedicated ZAP model support.',
    '',
  ];

  if (findings.length === 0) {
    mdLines.push(
      'No cloud products were found with populated repositories, Sonar scan results, ACS results, or ZAP results.',
    );
  } else {
    for (const row of findings) {
      mdLines.push(`## [${row.context}] ${row.name} (${row.licencePlate})`);
      mdLines.push('');
      mdLines.push(`- Provider/Cluster: ${row.providerOrCluster}`);
      mdLines.push(`- Status: ${row.status}`);
      mdLines.push(
        `- Organization: ${row.organizationCode || '(none)'} ${
          row.organizationName ? `- ${row.organizationName}` : ''
        }`.trim(),
      );
      mdLines.push(`- Repositories: ${row.repositoryCount}`);
      if (row.repositories.length > 0) {
        mdLines.push(`- Repository URLs: ${row.repositories.join(', ')}`);
      }
      mdLines.push(`- Sonar scans: ${row.sonarScanCount}`);
      if (row.latestSonarScannedAt) {
        mdLines.push(`- Latest Sonar scan: ${row.latestSonarScannedAt}`);
      }
      mdLines.push(`- ACS present: ${row.acsPresent ? 'yes' : 'no'}`);
      if (row.acsPresent) {
        mdLines.push(`- ACS alerts/images: ${row.acsAlertCount}/${row.acsImageCount}`);
        if (row.latestAcsScannedAt) {
          mdLines.push(`- Latest ACS scan: ${row.latestAcsScannedAt}`);
        }
      }
      mdLines.push(`- ZAP supported: ${row.zapSupported ? 'yes' : 'no'}`);
      mdLines.push(`- ZAP scans: ${row.zapScanCount}`);
      if (row.latestZapScannedAt) {
        mdLines.push(`- Latest ZAP scan: ${row.latestZapScannedAt}`);
      }
      mdLines.push(`- Notes: ${row.notes.join('; ')}`);
      mdLines.push('');
    }
  }

  await mkdir(path.dirname(csvPath), { recursive: true });
  await Promise.all([
    writeFile(csvPath, csvLines, 'utf8'),
    writeFile(jsonPath, JSON.stringify(summary, null, 2), 'utf8'),
    writeFile(mdPath, mdLines.join('\n'), 'utf8'),
  ]);

  logger.info('find-cloud-products-with-security-data completed', {
    scannedProducts: products.length,
    matchedProducts: findings.length,
    repositoryMatches: summary.repositoryMatches,
    sonarMatches: summary.sonarMatches,
    acsMatches: summary.acsMatches,
    zapMatches: summary.zapMatches,
    outputs: summary.outputs,
  });

  console.log(
    `${findings.length} cloud products matched. ${summary.repositoryMatches} with repositories, ${summary.sonarMatches} with Sonar results, ${summary.acsMatches} with ACS results, ${summary.zapMatches} with ZAP results.`,
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  logger.error('find-cloud-products-with-security-data failed', error);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
