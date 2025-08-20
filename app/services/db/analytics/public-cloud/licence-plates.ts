import prisma from '@/core/prisma';
import { Provider, Prisma } from '@/prisma/client';

export async function getPublicLicencePlates({
  userId,
  providers,
  ministries,
}: {
  userId?: string;
  providers?: Provider[];
  ministries?: string[];
}) {
  const where: Prisma.PublicCloudRequestDataWhereInput = {};

  if (providers && providers.length > 0) {
    where.provider = { in: providers };
  }

  if (ministries && ministries.length > 0) {
    const organizations = await prisma.organization.findMany({
      where: { code: { in: ministries } },
      select: { id: true },
    });
    where.organizationId = { in: organizations.map((org) => org.id) };
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
