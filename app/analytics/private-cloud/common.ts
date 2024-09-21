import { Cluster } from '@prisma/client';
import prisma from '@/core/prisma';

export async function getProdClusterLicencePlates() {
  const licencePlateRecords = await prisma.privateCloudProject.findMany({
    where: { cluster: { in: [Cluster.SILVER, Cluster.GOLD, Cluster.EMERALD] } },
    select: { licencePlate: true },
    distinct: ['licencePlate'],
  });

  return licencePlateRecords.map((row) => row.licencePlate);
}
