import { PrivateCloudEditRequestBody } from '@/schema';

const extractQuotaFirstNumber = (str: string): number => {
  const num = str
    .split(',')[0]
    .trim()
    .match(/\d+(\.\d+)?/g);
  return num ? Number(num) : 0;
};

export const isResourseDowngrade = (req: string, prod: string) => {
  return extractQuotaFirstNumber(req) < extractQuotaFirstNumber(prod);
};

export const isResourseUpgrade = (req: string, prod: string) => {
  return extractQuotaFirstNumber(req) > extractQuotaFirstNumber(prod);
};

export const isQuotaDowngrade = (request: PrivateCloudEditRequestBody, product: PrivateCloudEditRequestBody) => {
  return !(
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
