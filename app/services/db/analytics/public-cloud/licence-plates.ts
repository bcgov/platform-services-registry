import prisma from '@/core/prisma';
import { Provider, Ministry } from '@/prisma/client';

export async function getPublicLicencePlates({
  userId,
  providers,
  ministries,
  temporary,
}: {
  userId?: string;
  providers?: Provider[];
  ministries?: Ministry[];
  temporary?: string[];
}) {
  const where: any = {};

  if (providers && providers.length > 0) {
    where.provider = { in: providers };
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
  const licencePlateRecords = await prisma.publicCloudRequestData.findMany({
    where,
    select: { licencePlate: true },
    distinct: ['licencePlate'],
  });

  return licencePlateRecords.map((row) => row.licencePlate);
}
