import prisma from '@/core/prisma';
import { Organization } from '@/prisma/client';

export async function getOrganizationMap() {
  const orgs = await prisma.organization.findMany();
  const orgMap = orgs.reduce(
    (map, org) => {
      map[org.id] = org;
      return map;
    },
    {} as Record<string, Organization>,
  );

  return orgMap;
}
