import { $Enums } from '@prisma/client';
import formatDate from '@/utils/date';
import { formatFullName } from '@/helpers/user';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { CsvResponse, NoContent, UnauthorizedResponse } from '@/core/responses';
import { searchPublicCloudProducts } from '@/queries/public-cloud-products';

const queryParamSchema = z.object({
  search: z.string().optional(),
  ministry: z.nativeEnum($Enums.Ministry).optional(),
  provider: z.nativeEnum($Enums.Provider).optional(),
  active: z.string().optional(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams, session }) => {
  const { search, ministry, provider, active } = queryParams;

  const { docs, totalCount } = await searchPublicCloudProducts({
    session,
    skip: 0,
    take: 1000,
    ministry,
    provider,
    active: active === 'true',
    search,
  });

  if (totalCount === 0) {
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
