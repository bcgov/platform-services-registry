import { EventType, ProjectStatus } from '@prisma/client';
import { join } from 'lodash-es';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { ministryKeyToName } from '@/helpers/product';
import { formatFullName } from '@/helpers/user';
import { createEvent } from '@/mutations/events';
import { searchPublicCloudProducts } from '@/queries/public-cloud-products';
import { formatDateSimple } from '@/utils/date';
import { publicCloudProductSearchNoPaginationBodySchema } from '@/validation-schemas/public-cloud';

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: publicCloudProductSearchNoPaginationBodySchema },
})(async ({ session, body }) => {
  const searchProps = {
    page: 1,
    pageSize: 10000,
    ...body,
  };

  const { docs, totalCount } = await searchPublicCloudProducts({
    session,
    ...searchProps,
  });

  if (docs.length === 0) {
    return NoContent();
  }

  const formattedData = docs.map((project) => ({
    Name: project.name,
    Description: project.description,
    Ministry: ministryKeyToName(project.ministry),
    Provider: project.provider,
    'Reasons for Selecting Cloud Provider': join(project.providerSelectionReasons, ', '),
    'Description of Selected Reasons': project.providerSelectionReasonsNote,
    'Project Owner Email': project.projectOwner.email,
    'Project Owner Name': formatFullName(project.projectOwner),
    'Primary Technical Lead Email': project.primaryTechnicalLead.email,
    'Primary Technical Lead Name': formatFullName(project.primaryTechnicalLead),
    'Secondary Technical Lead Email': project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
    'Secondary Technical Lead Name': formatFullName(project.secondaryTechnicalLead),
    'Create Date': formatDateSimple(project.createdAt),
    'Update Date': formatDateSimple(project.updatedAt),
    'Licence Plate': project.licencePlate,
    Status: project.status,
  }));

  await createEvent(EventType.EXPORT_PUBLIC_CLOUD_PRODUCT, session.user.id, searchProps);

  return CsvResponse(formattedData, 'public-cloud-products.csv');
});
