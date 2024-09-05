import { ProjectStatus } from '@prisma/client';
import _sum from 'lodash-es/sum';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { CsvResponse, NoContent } from '@/core/responses';
import { ministryKeyToName } from '@/helpers/product';
import { PermissionsEnum } from '@/types/permissions';
import { extractNumbers } from '@/utils/string';

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.ViewGeneralAnalytics],
});

export const GET = apiHandler(async () => {
  const products = await prisma.privateCloudProject.findMany({ where: { status: ProjectStatus.ACTIVE } });

  return CsvResponse(
    products.map((row) => {
      const devCpu = extractNumbers(row.developmentQuota.cpu);
      const devMemory = extractNumbers(row.developmentQuota.memory);
      const devStorage = extractNumbers(row.developmentQuota.storage);

      const testCpu = extractNumbers(row.testQuota.cpu);
      const testMemory = extractNumbers(row.testQuota.memory);
      const testStorage = extractNumbers(row.testQuota.storage);

      const prodCpu = extractNumbers(row.productionQuota.cpu);
      const prodMemory = extractNumbers(row.productionQuota.memory);
      const prodStorage = extractNumbers(row.productionQuota.storage);

      const toolsCpu = extractNumbers(row.toolsQuota.cpu);
      const toolsMemory = extractNumbers(row.toolsQuota.memory);
      const toolsStorage = extractNumbers(row.toolsQuota.storage);

      const cpuRequestTotal = _sum([devCpu[0], testCpu[0], prodCpu[0], toolsCpu[0]]);
      const cpuLimitTotal = _sum([devCpu[1], testCpu[1], prodCpu[1], toolsCpu[1]]);
      const memoryRequestTotal = _sum([devMemory[0], testMemory[0], prodMemory[0], toolsMemory[0]]);
      const memoryLimitTotal = _sum([devMemory[1], testMemory[1], prodMemory[1], toolsMemory[1]]);
      const storageTotal = _sum([devStorage[0], testStorage[0], prodStorage[0], toolsStorage[0]]);

      return {
        'Product Name': row.name,
        'Ministry Short': row.ministry,
        'Ministry Name': ministryKeyToName(row.ministry),
        'CPU Request Total': cpuRequestTotal,
        'CPU Limit Total': cpuLimitTotal,
        'Memory Request Total': memoryRequestTotal,
        'Memory Limit Total': memoryLimitTotal,
        'Storage Total': storageTotal,
      };
    }),
    'quota-summary.csv',
  );
});
