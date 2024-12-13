import { ProjectStatus } from '@prisma/client';
import { OkResponse } from '@/core/responses';
import { ministryKeyToName } from '@/helpers/product';
import { searchPublicCloudProducts, SearchPublicCloudProductsProps } from '@/services/db';

export default async function listOp({
  session,
  page,
  skip,
  take,
  ministries,
  providers,
  status,
}: SearchPublicCloudProductsProps) {
  const { docs, totalCount } = await searchPublicCloudProducts({
    session,
    page,
    skip,
    take,
    ministries,
    providers,
    status,
  });

  const data = docs.map((doc) => {
    return {
      id: doc.id,
      active: doc.status === ProjectStatus.ACTIVE,
      licencePlate: doc.licencePlate,
      name: doc.name,
      description: doc.description,
      ministry: doc.ministry,
      ministryName: ministryKeyToName(doc.ministry),
      provider: doc.provider,
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
  });

  return OkResponse({ success: true, data, totalCount, pagination: { page, pageSize: take, skip, take } });
}
