import _sum from 'lodash-es/sum';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { formatFullName } from '@/helpers/user';
import { Cluster, EventType } from '@/prisma/client';
import { createEvent, searchPrivateCloudProducts } from '@/services/db';
import { getOrganizationMap } from '@/services/db/organization';
import { PrivateProductCsvRecord } from '@/types/csv';
import { formatDateSimple } from '@/utils/js';
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

  const orgMap = await getOrganizationMap();

  const formattedData: PrivateProductCsvRecord[] = docs.map((project) => {
    const org = orgMap[project.organizationId];

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

    let clusterName: string = project.cluster;
    if (project.cluster === Cluster.GOLD && project.golddrEnabled) {
      cpuRequestTotal *= 2;
      memoryRequestTotal *= 2;
      storageTotal *= 2;

      clusterName = 'GOLD (DR)';
    }

    return {
      Name: project.name,
      Description: project.description,
      Ministry: org.name,
      Cluster: clusterName,
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
      'Total memory quota (GiB)': String(memoryRequestTotal),
      'Total storage quota (GiB)': String(storageTotal),
      Status: project.status,
    };
  });

  await createEvent(EventType.EXPORT_PRIVATE_CLOUD_PRODUCT, session.user.id, searchProps);

  return CsvResponse(formattedData, 'private-cloud-products.csv');
});
