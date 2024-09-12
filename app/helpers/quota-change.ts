import _toNumber from 'lodash-es/toNumber';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '@/../app/constants';
import { totalMetrics } from '@/services/openshift-kubernetis-metrics/helpers';
import getPodMetrics from '@/services/openshift-kubernetis-metrics/pod-usage-metrics';
import { PrivateCloudProductSimple } from '@/types/private-cloud';
import { extractNumbers } from '@/utils/string';
import { PrivateCloudEditRequestBody } from '@/validation-schemas/private-cloud';

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
    ['dev', 'test', 'prod', 'tools'].forEach(async (namespace) => {
      const podMetricsData = await getPodMetrics(project.licencePlate, namespace, request.cluster);
      if (!podMetricsData) return;
      const { totalUsage, totalLimit } = totalMetrics(podMetricsData, resource);

      if (totalLimit && totalUsage) {
        if ((totalLimit / totalUsage) * 100 < 86) {
          ifAutoApproval = true;
        }

        if (!ifAutoApproval) return ifAutoApproval;
        const utilizationRate = (_toNumber(request.developmentQuota.cpu.match(/\d+/)) / totalUsage) * 100;
        if (utilizationRate > 34) {
          ifAutoApproval = true;
        }
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
