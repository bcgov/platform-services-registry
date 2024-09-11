import _toNumber from 'lodash-es/toNumber';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '@/../app/constants';
import { PrivateCloudProductSimple } from '@/types/private-cloud';
import { extractNumbers } from '@/utils/string';
import { PrivateCloudEditRequestBody } from '@/validation-schemas/private-cloud';

const getPodMetricsTmp = (licencePlate: string, namespacePostfix: string, cluster: string) => {
  return [
    {
      name: 'mautic-40-j496b',
      usage: { cpu: '0m', memory: '261612Ki' },
      limits: { cpu: '1000m', memory: '2097152Ki' },
      requests: { cpu: '50m', memory: '1048576Ki' },
    },
    {
      name: 'mautic-db-25-w5wpd',
      usage: { cpu: '3m', memory: '1642488Ki' },
      limits: { cpu: '1000m', memory: '2097152Ki' },
      requests: { cpu: '1000m', memory: '2097152Ki' },
    },
    {
      name: 'mautic-db-backup-3-ntbf6',
      usage: { cpu: '0m', memory: '0' },
      limits: { cpu: '0m', memory: '0' },
      requests: { cpu: '0m', memory: '0' },
    },
    {
      name: 'mautic-subscription-api-prod-9-65w4g',
      usage: { cpu: '0m', memory: '23504Ki' },
      limits: { cpu: '1000m', memory: '81920Ki' },
      requests: { cpu: '10m', memory: '40960Ki' },
    },
    {
      name: 'mautic-subscription-api-prod-9-fp2nx',
      usage: { cpu: '0m', memory: '11624Ki' },
      limits: { cpu: '1000m', memory: '81920Ki' },
      requests: { cpu: '10m', memory: '40960Ki' },
    },
    {
      name: 'mautic-subscription-api-prod-9-q7rcl',
      usage: { cpu: '0m', memory: '15160Ki' },
      limits: { cpu: '1000m', memory: '81920Ki' },
      requests: { cpu: '10m', memory: '40960Ki' },
    },
    {
      name: 'mautic-subscription-prod-39-d9hx5',
      usage: { cpu: '0m', memory: '19256Ki' },
      limits: { cpu: '50m', memory: '61440Ki' },
      requests: { cpu: '10m', memory: '30720Ki' },
    },
  ];
};

const getNum = (str: string) => _toNumber(str.match(/\d+/));

const areQuotasNextToEachOther = (
  projectQuota: string,
  requestQuota: string,
  options: { [x: string]: string },
): boolean => {
  const keys = Object.keys(options);
  const projectIndex = keys.indexOf(projectQuota);
  const requestIndex = keys.indexOf(requestQuota);

  return projectIndex !== -1 && requestIndex !== -1 && Math.abs(projectIndex - requestIndex) === 1;
};

export const isResourceUtilized = (project: PrivateCloudProductSimple, request: PrivateCloudEditRequestBody) => {
  const checkQuotasNextToEachOther = () => {
    const quotaTypes = ['cpu', 'memory', 'storage'] as const;
    const namespaces = ['testQuota', 'toolsQuota', 'developmentQuota', 'productionQuota'] as const;
    return namespaces.every((namespace) =>
      quotaTypes.every((resource) =>
        areQuotasNextToEachOther(
          project[namespace][resource],
          request[namespace][resource],
          resource === 'cpu'
            ? defaultCpuOptionsLookup
            : resource === 'memory'
              ? defaultMemoryOptionsLookup
              : defaultStorageOptionsLookup,
        ),
      ),
    );
  };
  let ifAutoApproval = checkQuotasNextToEachOther();
  if (!ifAutoApproval) return ifAutoApproval;

  (['cpu', 'memory'] as const).forEach((resource) => {
    ['dev', 'test', 'prod', 'tools'].forEach((namespace) => {
      const podMetricsData = getPodMetricsTmp(project.licencePlate, namespace, request.cluster);
      const totalUsage = podMetricsData.reduce((sum, pod) => sum + getNum(pod.usage[resource]), 0);
      const totalLimit = podMetricsData.reduce((sum, pod) => sum + getNum(pod.limits[resource]), 0);

      if ((totalLimit / totalUsage) * 100 < 86) {
        ifAutoApproval = true;
      }

      if (!ifAutoApproval) return ifAutoApproval;

      const utilizationRate = (getNum(request.developmentQuota.cpu) / totalUsage) * 100;
      if (utilizationRate > 34) {
        ifAutoApproval = true;
      }
      if (!ifAutoApproval) return ifAutoApproval;
    });
  });

  return ifAutoApproval;
};

export const isResourseDowngrade = (req: string, prod: string) => {
  return extractNumbers(req)[0] < extractNumbers(prod)[0];
};

export const isResourseUpgrade = (req: string, prod: string) => {
  return extractNumbers(req)[0] > extractNumbers(prod)[0];
};

export const isQuotaUpgrade = (request: any, product: any) => {
  return (
    isResourseUpgrade(request.productionQuota.cpu, product.productionQuota.cpu) ||
    isResourseUpgrade(request.productionQuota.memory, product.productionQuota.memory) ||
    isResourseUpgrade(request.productionQuota.storage, product.productionQuota.storage) ||
    isResourseUpgrade(request.developmentQuota.cpu, product.developmentQuota.cpu) ||
    isResourseUpgrade(request.developmentQuota.memory, product.developmentQuota.memory) ||
    isResourseUpgrade(request.developmentQuota.storage, product.developmentQuota.storage) ||
    isResourseUpgrade(request.testQuota.cpu, product.testQuota.cpu) ||
    isResourseUpgrade(request.testQuota.memory, product.testQuota.memory) ||
    isResourseUpgrade(request.testQuota.storage, product.testQuota.storage) ||
    isResourseUpgrade(request.toolsQuota.cpu, product.toolsQuota.cpu) ||
    isResourseUpgrade(request.toolsQuota.memory, product.toolsQuota.memory) ||
    isResourseUpgrade(request.toolsQuota.storage, product.toolsQuota.storage)
  );
};
