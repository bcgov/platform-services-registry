import { Session } from 'next-auth';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { ProjectStatus } from '@/prisma/client';
import { models } from '@/services/db';
import { getOrganizationMap } from '@/services/db/organization';

export default async function readOp({ session, idOrLicencePlate }: { session: Session; idOrLicencePlate: string }) {
  const where = idOrLicencePlate.length > 7 ? { id: idOrLicencePlate } : { licencePlate: idOrLicencePlate };

  const { data } = await models.privateCloudProduct.get(
    {
      where,
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true,
      },
    },
    session,
  );

  if (!data?._permissions.view) {
    return BadRequestResponse(`there is no product associated with key '${idOrLicencePlate}'`);
  }

  const orgMap = await getOrganizationMap();
  const org = orgMap[data.organizationId];

  const result = {
    id: data.id,
    active: data.status === ProjectStatus.ACTIVE,
    licencePlate: data.licencePlate,
    name: data.name,
    description: data.description,
    ministry: org.code,
    ministryName: org.name,
    cluster: data.cluster,
    projectOwner: {
      id: data.projectOwner.id,
      email: data.projectOwner.email,
      firstName: data.projectOwner.firstName,
      lastName: data.projectOwner.lastName,
    },
    primaryTechnicalLead: {
      id: data.primaryTechnicalLead.id,
      email: data.primaryTechnicalLead.email,
      firstName: data.primaryTechnicalLead.firstName,
      lastName: data.primaryTechnicalLead.lastName,
    },
    secondaryTechnicalLead: data.secondaryTechnicalLead
      ? {
          id: data.secondaryTechnicalLead.id,
          email: data.secondaryTechnicalLead.email,
          firstName: data.secondaryTechnicalLead.firstName,
          lastName: data.secondaryTechnicalLead.lastName,
        }
      : null,
  };

  return OkResponse({ success: true, data: result });
}
