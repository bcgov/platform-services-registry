import { z } from 'zod';
import { $Enums, Prisma } from '@prisma/client';
import formatDate from '@/utils/date';
import { formatFullName } from '@/helpers/user';
import createApiHandler from '@/core/api-handler';
import searchOp from '../_operations/search';
import { NoContent, CsvResponse } from '@/core/responses';
import { processEnumString, processUpperEnumString } from '@/utils/zod';
import { ministryKeyToName } from '@/helpers/product';

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

  const formattedData = docs.map((project) => ({
    Name: project.name,
    Description: project.description,
    Ministry: ministryKeyToName(project.ministry),
    Provider: project.provider,
    'Project Owner Email': project.projectOwner.email,
    'Project Owner Name': formatFullName(project.projectOwner),
    'Primary Technical Lead Email': project.primaryTechnicalLead.email,
    'Primary Technical Lead Name': formatFullName(project.primaryTechnicalLead),
    'Secondary Technical Lead Email': project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
    'Secondary Technical Lead Name': formatFullName(project.secondaryTechnicalLead),
    'Create Date': formatDate(project.created),
    'Update Date': formatDate(project.updatedAt),
    'Licence Plate': project.licencePlate,
    Status: project.status,
  }));

  return CsvResponse(formattedData, 'public-cloud-products.csv');
});
