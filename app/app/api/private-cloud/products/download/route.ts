import { Cluster, EventType } from '@prisma/client';
import _sum from 'lodash-es/sum';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { ministryKeyToName } from '@/helpers/product';
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

  const formattedData: PrivateProductCsvRecord[] = docs.map((project) => {
    let cpuRequestTotal = _sum([
      project.resourceRequests.development.cpu,
      project.resourceRequests.test.cpu,
      project.resourceRequests.production.cpu,
      project.resourceRequests.tools.cpu,
    ]);

    let memoryRequestTotal = _sum([
      project.resourceRequests.development.memory,
      project.resourceRequests.test.memory,
      project.resourceRequests.production.memory,
      project.resourceRequests.tools.memory,
    ]);

    let storageTotal = _sum([
      project.resourceRequests.development.storage,
      project.resourceRequests.test.storage,
      project.resourceRequests.production.storage,
      project.resourceRequests.tools.storage,
    ]);

    if (project.cluster === Cluster.GOLD && project.golddrEnabled) {
      cpuRequestTotal *= 2;
      memoryRequestTotal *= 2;
      storageTotal *= 2;
    }

    return {
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
      'Total compute quota (cores)': String(cpuRequestTotal),
      'Total memory quota (GB)': String(memoryRequestTotal),
      'Total storage quota (GB)': String(storageTotal),
      Status: project.status,
    };
  });

  await createEvent(EventType.EXPORT_PRIVATE_CLOUD_PRODUCT, session.user.id, searchProps);

  return CsvResponse(formattedData, 'private-cloud-products.csv');
});
