import { z } from 'zod';
import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyProducts';
import { publicCloudProjectDataToRow } from '@/helpers/row-mapper';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchActivePublicCloudRequests } from '@/queries/public-cloud-requests';
import createServerPage from '@/core/server-page';
import { Session } from 'next-auth';

const queryParamSchema = z.object({
  search: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  ministry: z.string().optional(),
  provider: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const publicCloudActiveRequests = createServerPage({
  roles: ['user'],
  fallbackUrl: '/login?callbackUrl=/public-cloud/products',
  validations: { queryParams: queryParamSchema },
});
export default publicCloudActiveRequests(async ({ pathParams, queryParams, session }) => {
  const { search, page: pageStr, pageSize: pageSizeStr, ministry, provider, sortKey, sortOrder } = queryParams;

  const { page, skip, take } = parsePaginationParams(pageStr ?? '', pageSizeStr ?? '', 10);

  const { docs, totalCount } = await searchActivePublicCloudRequests({
    session: session as Session,
    skip,
    take,
    ministry,
    provider,
    search,
    sortKey,
    sortOrder,
  });

  const transformActiveRequests = docs.map((request) => ({
    ...request.userRequestedProject,
    created: request.created,
    updatedAt: request.updatedAt,
    requests: [request],
    id: request.id,
  }));

  const activeRequests = transformActiveRequests.map(publicCloudProjectDataToRow);

  return (
    <Table
      title="Products in Public Cloud OpenShift Platform"
      description="Products with pending requests currently under admin review."
      tableBody={<NewTableBody rows={activeRequests} isLoading={false} />}
      total={totalCount}
      currentPage={page}
      pageSize={take}
      apiContext="public-cloud"
    />
  );
});
