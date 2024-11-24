import { Cluster, ProjectStatus } from '@prisma/client';
import _sum from 'lodash-es/sum';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { CsvResponse, NoContent } from '@/core/responses';
import { ministryKeyToName } from '@/helpers/product';

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
      resourceRequests: true,
    },
  });

  return CsvResponse(
    products.map((row) => {
      const devCpu = row.resourceRequests.development.cpu;
      const devMemory = row.resourceRequests.development.memory;
      const devStorage = row.resourceRequests.development.storage;

      const testCpu = row.resourceRequests.test.cpu;
      const testMemory = row.resourceRequests.test.memory;
      const testStorage = row.resourceRequests.test.storage;

      const prodCpu = row.resourceRequests.production.cpu;
      const prodMemory = row.resourceRequests.production.cpu;
      const prodStorage = row.resourceRequests.production.cpu;

      const toolsCpu = row.resourceRequests.tools.cpu;
      const toolsMemory = row.resourceRequests.tools.cpu;
      const toolsStorage = row.resourceRequests.tools.cpu;

      let cpuRequestTotal = _sum([devCpu, testCpu, prodCpu, toolsCpu]);
      let memoryRequestTotal = _sum([devMemory, testMemory, prodMemory, toolsMemory]);
      let storageTotal = _sum([devStorage, testStorage, prodStorage, toolsStorage]);

      if (row.cluster === Cluster.GOLD && row.golddrEnabled) {
        cpuRequestTotal *= 2;
        memoryRequestTotal *= 2;
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
        'Memory Request Total': memoryRequestTotal,
        'Storage Total': storageTotal,
      };
    }),
    'quota-summary.csv',
  );
});
