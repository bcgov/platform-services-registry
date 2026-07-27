import { IS_PROD, IS_TEST } from '@/config';
import { environmentShortNames } from '@/constants';
import { Cluster, ResourceRequestsEnv } from '@/prisma/client';
import { PdbPolicyIssue, PdbPolicyStatus } from '@/types/private-cloud';
import { getK8sClients } from './metrics/core';

const isLocal = !(IS_PROD || IS_TEST);

type PolicyReportResult = {
  policy?: string;
  rule?: string;
  result?: string;
  message?: string;
};

type PolicyReport = {
  metadata?: {
    name?: string;
    namespace?: string;
  };
  scope?: {
    kind?: string;
    name?: string;
  };
  results?: PolicyReportResult[];
};

type PolicyReportList = {
  items?: PolicyReport[];
};

export async function getPdbPolicyStatus(
  licencePlate: string,
  environment: keyof ResourceRequestsEnv,
  cluster: Cluster,
): Promise<PdbPolicyStatus> {
  const namespace = `${isLocal ? '101ed4' : licencePlate}-${environmentShortNames[environment]}`;
  const resolvedCluster = isLocal ? Cluster.SILVER : cluster;

  const { customClient } = getK8sClients(resolvedCluster);

  const response = (await customClient.listNamespacedCustomObject({
    group: 'wgpolicyk8s.io',
    version: 'v1alpha2',
    namespace,
    plural: 'policyreports',
  })) as PolicyReportList;

  const issues: PdbPolicyIssue[] = (response.items ?? []).flatMap((report) =>
    (report.results ?? [])
      .filter((result) => result.policy === 'pdb-replicas-audit' && result.result === 'fail')
      .map((result) => ({
        reportName: report.metadata?.name ?? '',
        resourceKind: report.scope?.kind ?? '',
        resourceName: report.scope?.name ?? '',
        policy: result.policy ?? '',
        rule: result.rule ?? '',
        message: result.message ?? '',
      })),
  );

  return {
    namespace,
    hasPdbIssues: issues.length > 0,
    issues,
  };
}
