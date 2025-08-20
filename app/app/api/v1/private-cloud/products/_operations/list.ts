import { OkResponse } from '@/core/responses';
import { ProjectStatus } from '@/prisma/client';
import { searchPrivateCloudProducts, SearchPrivateCloudProductsProps } from '@/services/db';
import { getOrganizationMap } from '@/services/db/organization';

export default async function listOp({
  session,
  page,
  skip,
  take,
  ministries,
  clusters,
  status,
  temporary,
}: SearchPrivateCloudProductsProps) {
  const { docs, totalCount } = await searchPrivateCloudProducts({
    session,
    page,
    skip,
    take,
    ministries,
    clusters,
    status,
    temporary,
  });

  const orgMap = await getOrganizationMap();

  const data = await Promise.all(
    docs.map(async (doc) => {
      const org = orgMap[doc.organizationId];

      return {
        id: doc.id,
        active: doc.status === ProjectStatus.ACTIVE,
        licencePlate: doc.licencePlate,
        name: doc.name,
        description: doc.description,
        ministry: org.code,
        ministryName: org.name,
        cluster: doc.cluster,
        projectOwner: {
          id: doc.projectOwner.id,
          email: doc.projectOwner.email,
          firstName: doc.projectOwner.firstName,
          lastName: doc.projectOwner.lastName,
        },
        primaryTechnicalLead: {
          id: doc.primaryTechnicalLead.id,
          email: doc.primaryTechnicalLead.email,
          firstName: doc.primaryTechnicalLead.firstName,
          lastName: doc.primaryTechnicalLead.lastName,
        },
        secondaryTechnicalLead: doc.secondaryTechnicalLead
          ? {
              id: doc.secondaryTechnicalLead.id,
              email: doc.secondaryTechnicalLead.email,
              firstName: doc.secondaryTechnicalLead.firstName,
              lastName: doc.secondaryTechnicalLead.lastName,
            }
          : null,
      };
    }),
  );

  return OkResponse({ success: true, data, totalCount, pagination: { page, pageSize: take, skip, take } });
}
