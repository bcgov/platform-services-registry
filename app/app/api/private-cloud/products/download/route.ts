import { EventType, ProjectStatus } from '@prisma/client';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { ministryKeyToName, getTotalQuotaStr } from '@/helpers/product';
import { formatFullName } from '@/helpers/user';
import { createEvent, searchPrivateCloudProducts } from '@/services/db';
import { PrivateProductCsvRecord } from '@/types/csv';
import { formatDateSimple } from '@/utils/date';
import { privateCloudProductSearchNoPaginationBodySchema } from '@/validation-schemas/private-cloud';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: privateCloudProductSearchNoPaginationBodySchema },
})(async ({ session, body }) => {
  const searchProps = {
    page: 1,
    pageSize: 10000,
    ...body,
  };

  const { docs, totalCount } = await searchPrivateCloudProducts({
    session,
    ...searchProps,
  });

  if (docs.length === 0) {
    return NoContent();
  }

  const formattedData: PrivateProductCsvRecord[] = docs.map((project) => ({
    Name: project.name,
    Description: project.description,
    Ministry: ministryKeyToName(project.ministry),
    Cluster: project.cluster,
    'Project Owner email': project.projectOwner.email,
    'Project Owner name': formatFullName(project.projectOwner),
    'Primary Technical Lead email': project.primaryTechnicalLead.email,
    'Primary Technical Lead name': formatFullName(project.primaryTechnicalLead),
    'Secondary Technical Lead email': project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
    'Secondary Technical Lead name': formatFullName(project.secondaryTechnicalLead),
    'Create date': formatDateSimple(project.createdAt),
    'Update date': formatDateSimple(project.updatedAt),
    'Licence plate': project.licencePlate,
    'Total compute quota (cores)': getTotalQuotaStr(
      project.developmentQuota.cpu,
      project.testQuota.cpu,
      project.productionQuota.cpu,
      project.toolsQuota.cpu,
    ),
    'Total memory quota (GB)': getTotalQuotaStr(
      project.developmentQuota.memory,
      project.testQuota.memory,
      project.productionQuota.memory,
      project.toolsQuota.memory,
    ),
    'Total storage quota (GB)': getTotalQuotaStr(
      project.developmentQuota.storage,
      project.testQuota.storage,
      project.productionQuota.storage,
      project.toolsQuota.storage,
    ),
    Status: project.status,
  }));

  await createEvent(EventType.EXPORT_PRIVATE_CLOUD_PRODUCT, session.user.id, searchProps);

  return CsvResponse(formattedData, 'private-cloud-products.csv');
});
