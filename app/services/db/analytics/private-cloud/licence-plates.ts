import prisma from '@/core/prisma';
import { Cluster, Prisma } from '@/prisma/client';

export async function getPrivateLicencePlates({
  userId,
  clusters,
  ministries,
  temporary,
}: {
  userId?: string;
  clusters?: Cluster[];
  ministries?: string[];
  temporary?: string[];
}) {
  const where: Prisma.PrivateCloudRequestDataWhereInput = {};

  if (clusters && clusters.length > 0) {
    where.cluster = { in: clusters };
  }

  if (ministries && ministries.length > 0) {
    const organizations = await prisma.organization.findMany({
      where: { code: { in: ministries } },
      select: { id: true },
    });
    where.organizationId = { in: organizations.map((org) => org.id) };
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
