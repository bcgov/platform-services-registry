import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';

export async function getProdClusterLicencePlates() {
  const licencePlateRecords = await prisma.privateCloudProject.findMany({
    where: { cluster: { in: [$Enums.Cluster.SILVER, $Enums.Cluster.GOLD, $Enums.Cluster.EMERALD] } },
    select: { licencePlate: true },
    distinct: ['licencePlate'],
  });

  return licencePlateRecords.map((row) => row.licencePlate);
}
