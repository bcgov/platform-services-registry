import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';

export async function getProdClusterLicensePlates() {
  const prodClusterLicensePlates = await prisma.privateCloudProject.findMany({
    where: { cluster: { in: [$Enums.Cluster.SILVER, $Enums.Cluster.GOLD, $Enums.Cluster.EMERALD] } },
    select: { licencePlate: true },
    distinct: ['licencePlate'],
  });

  return prodClusterLicensePlates.map((row) => row.licencePlate);
}
