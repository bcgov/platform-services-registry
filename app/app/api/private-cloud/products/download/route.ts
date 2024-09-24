import { EventType, ProjectStatus } from '@prisma/client';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { ministryKeyToName, getTotalQuotaStr } from '@/helpers/product';
import { formatFullName } from '@/helpers/user';
import { createEvent } from '@/mutations/events';
import { searchPrivateCloudProducts } from '@/queries/private-cloud-products';
import { PrivateProductCsvRecord } from '@/types/csv';
import { formatDateSimple } from '@/utils/date';
import { privateCloudProductSearchNoPaginationBodySchema } from '@/validation-schemas/private-cloud';

export const POST = createApiHandler({
  roles: ['user'],
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
    'Project Owner Email': project.projectOwner.email,
    'Project Owner Name': formatFullName(project.projectOwner),
    'Primary Technical Lead Email': project.primaryTechnicalLead.email,
    'Primary Technical Lead Name': formatFullName(project.primaryTechnicalLead),
    'Secondary Technical Lead Email': project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
    'Secondary Technical Lead Name': formatFullName(project.secondaryTechnicalLead),
    'Create Date': formatDateSimple(project.createdAt),
    'Update Date': formatDateSimple(project.updatedAt),
    'Licence Plate': project.licencePlate,
    'Total Compute Quota (Cores)': getTotalQuotaStr(
      project.developmentQuota.cpu,
      project.testQuota.cpu,
      project.productionQuota.cpu,
      project.toolsQuota.cpu,
    ),
    'Total Memory Quota (Gb)': getTotalQuotaStr(
      project.developmentQuota.memory,
      project.testQuota.memory,
      project.productionQuota.memory,
      project.toolsQuota.memory,
    ),
    'Total Storage Quota (Gb)': getTotalQuotaStr(
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
