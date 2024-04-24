import { z } from 'zod';
import { $Enums, Prisma } from '@prisma/client';
import formatDate from '@/utils/date';
import { formatFullName } from '@/helpers/user';
import createApiHandler from '@/core/api-handler';
import searchOp from '../_operations/search';
import { NoContent, CsvResponse } from '@/core/responses';
import { processEnumString, processUpperEnumString } from '@/utils/zod';

const bodySchema = z.object({
  search: z.string().optional(),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Ministry).optional()),
  provider: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Provider).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: bodySchema },
})(async ({ session, body }) => {
  const { search = '', ministry = '', provider = '', includeInactive = false, sortKey, sortOrder } = body;

  const { docs, totalCount } = await searchOp({
    session,
    search,
    page: 1,
    pageSize: 10000,
    ministry,
    provider,
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
    provider: project.provider,
    projectOwnerEmail: project.projectOwner.email,
    projectOwnerName: formatFullName(project.projectOwner),
    primaryTechnicalLeadEmail: project.primaryTechnicalLead.email,
    primaryTechnicalLeadName: formatFullName(project.primaryTechnicalLead),
    secondaryTechnicalLeadEmail: project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
    secondaryTechnicalLeadName: formatFullName(project.secondaryTechnicalLead),
    created: formatDate(project.created),
    updatedAt: formatDate(project.updatedAt),
    licencePlate: project.licencePlate,
    status: project.status,
  }));

  return CsvResponse(formattedData, 'public-cloud-products.csv');
});
