import { Cluster, Ministry } from '@prisma/client';
import prisma from '@/core/prisma';

export async function getPrivateLicencePlates({
  userId,
  clusters,
  ministries,
  temporary,
}: {
  userId?: string;
  clusters?: Cluster[];
  ministries?: Ministry[];
  temporary?: string[];
}) {
  const where: any = {};

  if (clusters && clusters.length > 0) {
    where.cluster = { in: clusters };
  }

  if (ministries && ministries.length > 0) {
    where.ministry = { in: ministries };
  }

  if (temporary?.length) {
    if (temporary.includes('YES') && !temporary.includes('NO')) {
      where.isTest = true;
    } else if (temporary.includes('NO') && !temporary.includes('YES')) {
      where.isTest = false;
    }
  }

  if (userId) {
    where.OR = [
      { projectOwnerId: userId },
      { primaryTechnicalLeadId: userId },
      { secondaryTechnicalLeadId: userId },
      { members: { some: { userId } } },
    ];
  }
  const licencePlateRecords = await prisma.privateCloudRequestData.findMany({
    where,
    select: { licencePlate: true },
    distinct: ['licencePlate'],
  });

  return licencePlateRecords.map((row) => row.licencePlate);
}
