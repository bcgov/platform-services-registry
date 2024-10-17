import { EventType, ProjectStatus } from '@prisma/client';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { ministryKeyToName } from '@/helpers/product';
import { formatFullName } from '@/helpers/user';
import { createEvent, searchPublicCloudProducts } from '@/services/db';
import { formatDateSimple } from '@/utils/date';
import { publicCloudProductSearchNoPaginationBodySchema } from '@/validation-schemas/public-cloud';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
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
    'Reasons for selecting cloud provider': project.providerSelectionReasons.join(', '),
    'Description of selected reasons': project.providerSelectionReasonsNote,
    'Project Owner email': project.projectOwner.email,
    'Project Owner name': formatFullName(project.projectOwner),
    'Primary Technical Lead email': project.primaryTechnicalLead.email,
    'Primary Technical Lead name': formatFullName(project.primaryTechnicalLead),
    'Secondary Technical Lead email': project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
    'Secondary Technical Lead name': formatFullName(project.secondaryTechnicalLead),
    'Create date': formatDateSimple(project.createdAt),
    'Update date': formatDateSimple(project.updatedAt),
    'Licence plate': project.licencePlate,
    Status: project.status,
  }));

  await createEvent(EventType.EXPORT_PUBLIC_CLOUD_PRODUCT, session.user.id, searchProps);

  return CsvResponse(formattedData, 'public-cloud-products.csv');
});
