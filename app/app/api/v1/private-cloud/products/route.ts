import { ProjectStatus, Ministry, Cluster } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse } from '@/core/responses';
import { parsePaginationParams } from '@/helpers/pagination';
import { processNumber, processUpperEnumString } from '@/utils/js';
import listOp from './_operations/list';

const defaultPage = 1;
const defaultPageSize = 100;

const queryParamSchema = z.object({
  page: z.preprocess((v) => processNumber(v, { defaultValue: defaultPage }), z.number().min(1).max(1000).optional()),
  pageSize: z.preprocess(
    (v) => processNumber(v, { defaultValue: defaultPageSize }),
    z.number().min(1).max(1000).optional(),
  ),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum(Ministry).optional()),
  cluster: z.preprocess(processUpperEnumString, z.nativeEnum(Cluster).optional()),
  status: z.preprocess(processUpperEnumString, z.nativeEnum(ProjectStatus).optional()),
});

export const GET = createApiHandler({
  roles: ['service-account user'],
  useServiceAccount: true,
  validations: { queryParams: queryParamSchema },
})(async ({ session, queryParams }) => {
  const { page: _page, pageSize: _pageSize, ministry, cluster, status } = queryParams;

  const { skip, take, page } = parsePaginationParams(_page ?? defaultPage, _pageSize ?? defaultPageSize, 10);
  const response = await listOp({
    session,
    page,
    skip,
    take,
    ministries: ministry ? [ministry] : [],
    clusters: cluster ? [cluster] : [],
    status: status ? [status] : [],
    temporary: [],
  });

  return response;
});

// Important! It appears there is a bug in NextJS where it caches route information, including response data from third-party services (Keycloak)
// when only the GET method is used. Adding a placeholder POST method ensures that NextJS handles the requests correctly and avoids this caching issue. :()
export const POST = function () {
  return BadRequestResponse('placeholder route');
};
