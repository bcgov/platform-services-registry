import { NextRequest, NextResponse } from 'next/server';
import { $Enums } from '@prisma/client';
import formatDate from '@/utils/date';
import { formatFullName } from '@/helpers/user';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';
import { searchPrivateCloudProducts } from '@/queries/private-cloud-products';

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
    return NextResponse.json('Unauthorized', { status: 401 });
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
    status: project.status,
  }));

  return CsvResponse(formattedData, 'private-cloud-products.csv');
});
