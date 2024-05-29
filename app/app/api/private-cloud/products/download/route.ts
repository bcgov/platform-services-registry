import { $Enums, Prisma } from '@prisma/client';
import forEach from 'lodash-es/forEach';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { ministryKeyToName } from '@/helpers/product';
import { formatFullName } from '@/helpers/user';
import { formatDateSimple } from '@/utils/date';
import { extractNumbers } from '@/utils/string';
import { processEnumString, processUpperEnumString } from '@/utils/zod';
import searchOp from '../_operations/search';

function getTotalQuota(...quotaValues: string[]) {
  let total = 0;
  forEach(quotaValues, (val) => {
    const nums = extractNumbers(val);
    if (nums.length > 0) total += nums[0];
  });

  return total;
}

const bodySchema = z.object({
  search: z.string().optional(),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Ministry).optional()),
  cluster: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Cluster).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
  showTest: z.boolean().default(false),
});

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: bodySchema },
})(async ({ session, body }) => {
  const {
    search = '',
    ministry = '',
    cluster = '',
    includeInactive = false,
    showTest = false,
    sortKey,
    sortOrder,
  } = body;

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
    isTest: showTest,
  });

  if (docs.length === 0) {
    return NoContent();
  }

  const formattedData = docs.map((project) => ({
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
    'Create Date': formatDateSimple(project.created),
    'Updated Date': formatDateSimple(project.updatedAt),
    'Licence Plate': project.licencePlate,
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
    Status: project.status,
  }));

  return CsvResponse(formattedData, 'private-cloud-products.csv');
});
