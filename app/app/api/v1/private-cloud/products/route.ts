import { $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { generateSession } from '@/core/auth-options';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { parsePaginationParams } from '@/helpers/pagination';
import { ministryKeyToName } from '@/helpers/product';
import { searchPrivateCloudProducts } from '@/queries/private-cloud-products';
import { findUser } from '@/services/keycloak/app-realm';
import { processNumber } from '@/utils/zod';

const defaultPage = 1;
const defaultPageSize = 100;

const queryParamSchema = z.object({
  page: z.preprocess((v) => processNumber(v, { defaultValue: defaultPage }), z.number().min(1).max(1000).optional()),
  pageSize: z.preprocess(
    (v) => processNumber(v, { defaultValue: defaultPageSize }),
    z.number().min(1).max(1000).optional(),
  ),
});

const apiHandler = createApiHandler({
  keycloakOauth2: { requiredClaims: ['kc-userid'] },
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams, jwtData }) => {
  const kcUserId = jwtData['kc-userid'];
  const kcUser = await findUser(kcUserId);
  if (!kcUser) return BadRequestResponse('keycloak user not found');

  const session = await generateSession({
    session: {} as Session,
    token: { email: kcUser.email, roles: kcUser.authRoleNames },
  });

  const { page: _page, pageSize: _pageSize } = queryParams;

  const { skip, take, page } = parsePaginationParams(_page ?? defaultPage, _pageSize ?? defaultPageSize, 10);

  const { docs, totalCount } = await searchPrivateCloudProducts({
    session: session as Session,
    skip,
    take,
    active: false,
    isTest: false,
  });

  const data = docs.map((doc) => {
    return {
      active: doc.status === $Enums.ProjectStatus.ACTIVE,
      licencePlate: doc.licencePlate,
      name: doc.name,
      description: doc.description,
      ministry: doc.ministry,
      ministryName: ministryKeyToName(doc.ministry),
      cluster: doc.cluster,
      projectOwner: {
        firstName: doc.projectOwner.firstName,
        lastName: doc.projectOwner.lastName,
      },
      primaryTechnicalLead: {
        firstName: doc.primaryTechnicalLead.firstName,
        lastName: doc.primaryTechnicalLead.lastName,
      },
      secondaryTechnicalLead: doc.secondaryTechnicalLead
        ? {
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
