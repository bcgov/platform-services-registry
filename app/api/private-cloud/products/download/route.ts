import { z } from 'zod';
import forEach from 'lodash-es/forEach';
import { $Enums, Prisma } from '@prisma/client';
import formatDate from '@/utils/date';
import { formatFullName } from '@/helpers/user';
import createApiHandler from '@/core/api-handler';
import searchOp from '../_operations/search';
import { NoContent, CsvResponse } from '@/core/responses';
import { extractNumbers } from '@/utils/string';
import { processEnumString } from '@/utils/zod';

function getTotalQuota(...quotaValues: string[]) {
  let total = 0;
  forEach(quotaValues, (val) => {
    const nums = extractNumbers(val);
    if (nums.length > 0) total += nums[0];
  });

  return total;
}

export const bodySchema = z.object({
  search: z.string().optional(),
  ministry: z.preprocess(processEnumString, z.nativeEnum($Enums.Ministry).optional()),
  cluster: z.preprocess(processEnumString, z.nativeEnum($Enums.Cluster).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.nativeEnum(Prisma.SortOrder).optional(),
});

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: bodySchema },
})(async ({ session, body }) => {
  const { search = '', ministry = '', cluster = '', includeInactive = false, sortKey, sortOrder } = body;

  const { docs, totalCount } = await searchOp({
    session,
    search,
    page: 1,
    pageSize: 10000,
    ministry,
    cluster,
    active: !includeInactive,
    sortKey: sortKey || undefined,
    sortOrder,
  });

  if (docs.length === 0) {
    return NoContent();
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
