import { ProjectStatus, Ministry, Provider } from '@prisma/client';
import { Session } from 'next-auth';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { parsePaginationParams } from '@/helpers/pagination';
import { ministryKeyToName } from '@/helpers/product';
import { searchPublicCloudProducts } from '@/services/db';
import { processNumber, processUpperEnumString, processBoolean } from '@/utils/js';

const defaultPage = 1;
const defaultPageSize = 100;

const queryParamSchema = z.object({
  page: z.preprocess((v) => processNumber(v, { defaultValue: defaultPage }), z.number().min(1).max(1000).optional()),
  pageSize: z.preprocess(
    (v) => processNumber(v, { defaultValue: defaultPageSize }),
    z.number().min(1).max(1000).optional(),
  ),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum(Ministry).optional()),
  provider: z.preprocess(processUpperEnumString, z.nativeEnum(Provider).optional()),
  status: z.preprocess(processUpperEnumString, z.nativeEnum(ProjectStatus).optional()),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User, GlobalRole.ServiceAccount],
  useServiceAccount: true,
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams, session }) => {
  const { page: _page, pageSize: _pageSize, ministry, provider, status } = queryParams;

  const { skip, take, page } = parsePaginationParams(_page ?? defaultPage, _pageSize ?? defaultPageSize, 10);

  const { docs, totalCount } = await searchPublicCloudProducts({
    session: session as Session,
    skip,
    take,
    ministries: ministry ? [ministry] : [],
    providers: provider ? [provider] : [],
    status: status ? [status] : [],
  });

  const data = docs.map((doc) => {
    return {
      id: doc.id,
      active: doc.status === ProjectStatus.ACTIVE,
      licencePlate: doc.licencePlate,
      name: doc.name,
      description: doc.description,
      ministry: doc.ministry,
      ministryName: ministryKeyToName(doc.ministry),
      provider: doc.provider,
      projectOwner: {
        id: doc.projectOwner.id,
        firstName: doc.projectOwner.firstName,
        lastName: doc.projectOwner.lastName,
      },
      primaryTechnicalLead: {
        id: doc.primaryTechnicalLead.id,
        firstName: doc.primaryTechnicalLead.firstName,
        lastName: doc.primaryTechnicalLead.lastName,
      },
      secondaryTechnicalLead: doc.secondaryTechnicalLead
        ? {
            id: doc.secondaryTechnicalLead.id,
            firstName: doc.secondaryTechnicalLead.firstName,
            lastName: doc.secondaryTechnicalLead.lastName,
          }
        : null,
    };
  });

  return OkResponse({ success: true, data, totalCount, pagination: { page, pageSize: take, skip, take } });
});

// Important! It appears there is a bug in NextJS where it caches route information, including response data from third-party services (Keycloak)
// when only the GET method is used. Adding a placeholder POST method ensures that NextJS handles the requests correctly and avoids this caching issue. :()
export const POST = function () {
  return BadRequestResponse('placeholder route');
};
