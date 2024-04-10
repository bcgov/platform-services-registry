import { $Enums } from '@prisma/client';
import forEach from 'lodash-es/forEach';
import formatDate from '@/utils/date';
import { formatFullName } from '@/helpers/user';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { CsvResponse, UnauthorizedResponse } from '@/core/responses';
import { searchPrivateCloudProducts } from '@/queries/private-cloud-products';
import { extractNumbers } from '@/utils/string';

function getTotalQuota(...quotaValues: string[]) {
  let total = 0;
  forEach(quotaValues, (val) => {
    const nums = extractNumbers(val);
    if (nums.length > 0) total += nums[0];
  });

  return total;
}

const queryParamSchema = z.object({
  search: z.string().optional(),
  ministry: z.nativeEnum($Enums.Ministry).optional(),
  cluster: z.nativeEnum($Enums.Cluster).optional(),
  active: z.string().optional(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams, session }) => {
  if (!session) {
    return UnauthorizedResponse('Unauthorized');
  }

  const { search, ministry, cluster, active } = queryParams;

  const { docs, totalCount } = await searchPrivateCloudProducts({
    session,
    skip: 0,
    take: 1000,
    ministry,
    cluster,
    active: active === 'true',
    search,
  });

  if (totalCount === 0) {
    return new Response(null, { status: 204 });
  }

  // Map the data to the correct format for CSV conversion
  const formattedData = docs.map((project) => ({
    name: project.name,
    description: project.description,
    ministry: project.ministry,
    cluster: project.cluster,
    projectOwnerEmail: project.projectOwner.email,
    projectOwnerName: formatFullName(project.projectOwner),
    primaryTechnicalLeadEmail: project.primaryTechnicalLead.email,
    primaryTechnicalLeadName: formatFullName(project.primaryTechnicalLead),
    secondaryTechnicalLeadEmail: project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
    secondaryTechnicalLeadName: formatFullName(project.secondaryTechnicalLead),
    created: formatDate(project.created),
    updatedAt: formatDate(project.updatedAt),
    licencePlate: project.licencePlate,
    'Total Compute Quota (Cores)': getTotalQuota(
      project.developmentQuota.cpu,
      project.testQuota.cpu,
      project.productionQuota.cpu,
      project.toolsQuota.cpu,
    ),
    'Total Memory Quota (Gb)': getTotalQuota(
      project.developmentQuota.memory,
      project.testQuota.memory,
      project.productionQuota.memory,
      project.toolsQuota.memory,
    ),
    'Total Storage Quota (Gb)': getTotalQuota(
      project.developmentQuota.storage,
      project.testQuota.storage,
      project.productionQuota.storage,
      project.toolsQuota.storage,
    ),
    status: project.status,
  }));

  return CsvResponse(formattedData, 'private-cloud-products.csv');
});
