import { Cluster, ProjectStatus } from '@prisma/client';
import _sum from 'lodash-es/sum';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { CsvResponse, NoContent } from '@/core/responses';
import { ministryKeyToName } from '@/helpers/product';
import { extractNumbers } from '@/utils/string';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
});

export const GET = apiHandler(async () => {
  const products = await prisma.privateCloudProject.findMany({
    where: { status: ProjectStatus.ACTIVE },
    select: {
      name: true,
      licencePlate: true,
      ministry: true,
      cluster: true,
      golddrEnabled: true,
      developmentQuota: true,
      testQuota: true,
      productionQuota: true,
      toolsQuota: true,
    },
  });

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

      let cpuRequestTotal = _sum([devCpu[0], testCpu[0], prodCpu[0], toolsCpu[0]]);
      let cpuLimitTotal = _sum([devCpu[1], testCpu[1], prodCpu[1], toolsCpu[1]]);
      let memoryRequestTotal = _sum([devMemory[0], testMemory[0], prodMemory[0], toolsMemory[0]]);
      let memoryLimitTotal = _sum([devMemory[1], testMemory[1], prodMemory[1], toolsMemory[1]]);
      let storageTotal = _sum([devStorage[0], testStorage[0], prodStorage[0], toolsStorage[0]]);

      if (row.cluster === Cluster.GOLD && row.golddrEnabled) {
        cpuRequestTotal *= 2;
        cpuLimitTotal *= 2;
        memoryRequestTotal *= 2;
        memoryLimitTotal *= 2;
        storageTotal *= 2;
      }

      return {
        'Product name': row.name,
        'Licence Plate': row.licencePlate,
        'Ministry Short': row.ministry,
        'Ministry Name': ministryKeyToName(row.ministry),
        Cluster: row.cluster,
        'Gold DR': row.golddrEnabled ? 'Yes' : '',
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
